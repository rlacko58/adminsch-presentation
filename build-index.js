// Generates index.html's <article> content FROM tortenet.md, using data.js as the
// data source for every chart/table/event-card. tortenet.md is the single source of
// truth for prose; directive comments (<!-- @name ... -->) mark where interactive
// content attaches. Page chrome (topbar/year-rail/toc-rail/lightbox/scripts) is an
// unchanged template read straight out of the CURRENT index.html and spliced around
// the generated <article> — this script only ever touches what's between
// <article> and </article>.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const MarkdownIt = require('markdown-it');

const DIR = __dirname;
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

function loadDataJs() {
  const src = fs.readFileSync(path.join(DIR, 'data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'data.js' });
  return sandbox;
}

function pngDims(relSrc) {
  const buf = fs.readFileSync(path.join(DIR, relSrc));
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const D = loadDataJs();

// ---- heading -> section / data-year lookup tables ----
const SECTION_MAP = {
  'Rólam':                        { id: 'sec-about',        mode: 'hidden' },
  'Intro':                        { id: 'sec-intro',         mode: 'hidden' },
  'Sztori és szakma':              { id: 'sec-story',         mode: 'basic' },
  'Architektúra':                  { id: 'sec-architecture',  mode: 'basic' },
  'Fejlesztések és statisztikák':  { id: 'sec-dev',           mode: 'full' },
  'Köszönet':                      { id: 'sec-thanks',        mode: 'hidden' },
};
const YEAR_MAP = {
  '2013 — amit örököltem': '2013.1',
  '2015–2019 — az újraírási kísérletek': '2015.2',
  'És akkor kanyarodjunk vissza': '2019.6',
  '2020–2021 — A projekt lassú halála': '2020.2',
  '2021 — Akkor vége?': '2021.3',
  '2022. június 25. — AdminSCH Code': '2022.48',
  '2022 december — a második workshop': '2022.96',
  '2023 nyár — lezárás': '2023.5',
  '2024–2026 — a stafétabot': '2024.1',
};
const SUPPRESSED_TABLE_HEADERS = ['| Kezdeményezés |', '| Közreműködő |', '| Év | Kiadott tag-ek |'];

// ---- directive expanders (each returns an HTML string) ----
function chartCard(id, { legend, labels, caption } = {}) {
  let inner = '';
  if (legend) inner += `<div id="legend-${legend}" class="legend"></div>\n    `;
  if (labels) {
    inner += `<div class="timeline-scroll"><div id="chart-${id}-labels"></div><div id="chart-${id}"></div></div>\n    `;
  } else {
    inner += `<div id="chart-${id}"></div>\n    `;
  }
  if (caption) inner += `<p class="chart-caption">${caption}</p>\n  `;
  return `<div class="card">\n    ${inner.trim()}\n  </div>`;
}

function eventCardsHtml() {
  const cards = D.INITIATIVES.map((ev, i) => {
    const range = ev.start === ev.end ? ev.start : `${ev.start} → ${ev.end}`;
    const name = /-service|-app|-job|helm-charts|ci-templates|adminsch-|vlan-service|schaccreg/.test(ev.name) && ev.name.includes('`')
      ? ev.name
      : ev.name;
    return `  <div class="event-card" id="ev-${i}" data-idx="${i}">
    <div class="event-meta"><span>${range}</span><span>${ev.people}</span></div>
    <h4>${md.renderInline(name)}</h4>
    <p>${md.renderInline(ev.desc)}</p>
  </div>`;
  }).join('\n');
  return cards;
}

function locTableHtml() {
  return `<div class="stat-row cols-5" id="loc-stat-row"></div>

  <div class="loc-legend">
    <div class="loc-legend-item"><span class="loc-legend-swatch" style="background:var(--accent)"></span>aktív</div>
    <div class="loc-legend-item"><span class="loc-legend-swatch" style="background:var(--gridline);border:1px solid var(--border)"></span>eltűnt (felülírva/törölve)</div>
    <div class="loc-legend-item"><span class="loc-legend-swatch" style="background:var(--other)"></span>archivált</div>
  </div>

  <div class="table-scroll">
    <table class="loc-table" id="loc-table">
      <thead>
        <tr>
          <th data-key="name" style="text-align:left">Közreműködő</th>
          <th data-key="commits">Commit</th>
          <th data-key="added">Hozzáadott</th>
          <th data-key="removed">Törölt</th>
          <th data-key="survives_archived">Archivált</th>
          <th data-key="net">Nettó</th>
          <th data-key="survives_active">Ma is él</th>
          <th data-key="activePct">Megoszlás</th>
        </tr>
      </thead>
      <tbody id="loc-tbody"></tbody>
    </table>
  </div>
  <p class="chart-caption">Kattints egy oszlopfejlécre a rendezéshez. Húzd az egeret a „Megoszlás" sávra a pontos számokért.</p>`;
}

const THANKS_NAME_ALIAS = { 'Janega Zoltán (zolij)': 'zolij', 'Laszlo Rafael': 'Laszlo Rafael (én)', 'Eckl Máté': 'Eckl, Máté' };

function commitsFor(name) {
  const row = D.LOC_ROWS.find(r => r.name === (THANKS_NAME_ALIAS[name] || name));
  return row ? row.commits : 0;
}

function thanksWallHtml(namesLine) {
  const names = namesLine.replace(/\.\s*$/, '').split(',').map(s => s.trim()).filter(Boolean);
  names.sort((a, b) => commitsFor(b) - commitsFor(a));
  return `<div class="thanks-wall">
${names.map(n => `    <span class="thanks-name">${n}</span>`).join('\n')}
  </div>
  <div class="bottom-spacer"></div>`;
}

function diagramsHtml() {
  const tabs = [
    { file: 'transient-era.drawio', label: '2019 — vegyes rendszer', caption: 'Apache útvonal-alapú routing: a legtöbb kérés a legacy PHP-hoz megy, <code>/old/*</code> az új Django gateway-hez' },
    { file: 'full-microservice.drawio', label: '2022 — teljes microservice', caption: 'A 2022-es hackathon utáni teljes microservice-architektúra, kategóriánként csoportosítva' },
    { file: 'syncer-resilience.drawio', label: 'Syncer-architektúra', caption: 'A DNS/RADIUS/DHCP syncer-hármas: pull-alapú, generált konfiggal — AdminSCH nélkül is tovább szolgál ki kéréseket' },
  ];
  const xmls = tabs.map(t => fs.readFileSync(path.join(DIR, 'assets/diagrams', t.file), 'utf8'));
  const tabBtns = tabs.map((t, i) => `<button class="diagram-tab${i === 0 ? ' active' : ''}" onclick="showDiagram(${i})">${t.label}</button>`).join('\n      ');
  const panels = tabs.map((t, i) => {
    const mxAttr = JSON.stringify({ highlight: '#2a78d6', toolbar: 'zoom layers', edit: '_blank', xml: xmls[i], resize: true })
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `    <div class="diagram-panel${i === 0 ? ' active' : ''}" id="diagram-panel-${i}">
<div class="mxgraph" style="max-width:100%;border:none;" data-mxgraph="${mxAttr}"></div>
      <p class="diagram-caption">${t.caption}</p>
    </div>`;
  }).join('\n');
  return `<div class="card">
    <div class="diagram-tabs">
      ${tabBtns}
    </div>
${panels}
  </div>`;
}

function commitLogHtml(blockquoteLines) {
  const rows = [];
  for (const line of blockquoteLines) {
    const m = line.match(/\*\*„(.+?)”\*\*\s*—\s*(.+?),\s*(.+)$/);
    if (!m) continue;
    const [, subject, name, date] = m;
    const initials = name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    rows.push(`    <div class="commit-row">
      <div class="commit-avatar">${initials}</div>
      <div class="commit-body">
        <div class="commit-subject">${subject}</div>
        <div class="commit-meta">${name} · ${date}</div>
      </div>
    </div>`);
  }
  return `<div class="commit-list">\n${rows.join('\n')}\n  </div>`;
}

// ---- split tortenet.md into blocks (blank-line separated, multi-line constructs kept whole) ----
const DIRECTIVE_RE = /^<!--\s*@\S+.*-->$/;

function splitBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let cur = [];
  const flush = () => { if (cur.length) { blocks.push(cur.join('\n')); cur = []; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (DIRECTIVE_RE.test(line.trim())) {
      // a directive is always its own block, regardless of blank-line adjacency,
      // so content on the very next line (no blank line before it) never gets
      // silently swallowed into the same block as the directive.
      flush();
      blocks.push(line.trim());
    } else if (line.trim() === '') {
      // a blank line inside a blockquote only stays part of it if another
      // '>' line actually follows (multi-paragraph blockquote); otherwise
      // it's a real block boundary, even right after a blockquote ends
      let staysInBlockquote = false;
      if (cur.length && cur[cur.length - 1].startsWith('>')) {
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        staysInBlockquote = j < lines.length && lines[j].trim().startsWith('>');
      }
      if (staysInBlockquote) cur.push(line);
      else flush();
    } else if (line.trim() === '---') {
      flush();
      blocks.push('---');
    } else {
      cur.push(line);
    }
  }
  flush();
  return blocks.filter(b => b.trim() !== '');
}

const raw = fs.readFileSync(path.join(DIR, 'tortenet.md'), 'utf8');
const blocks = splitBlocks(raw);

let out = [];
let skipNext = false;
let nextPClass = null;
let expectCommitLog = false;
let sectionOpen = false;
let dek = null;

for (let bi = 0; bi < blocks.length; bi++) {
  const block = blocks[bi];
  const trimmed = block.trim();

  if (trimmed === '---') continue; // thematic breaks are a tortenet.md-only reading aid

  const directiveMatch = trimmed.match(/^<!--\s*@(\S+)(.*?)-->$/);
  if (directiveMatch) {
    const [, name, argStr] = directiveMatch;
    const args = {};
    for (const m of argStr.matchAll(/(\w+)=("[^"]*"|\S+)/g)) {
      args[m[1]] = m[2].replace(/^"|"$/g, '');
    }
    if (name === 'md-only') { skipNext = true; continue; }
    if (name === 'p' && args.class) { nextPClass = args.class; continue; }
    if (name === 'commit-log') { expectCommitLog = true; continue; }
    if (name === 'hr') { out.push('<hr>'); continue; }
    if (name === 'stat-row') { out.push(args.cols ? `<div class="stat-row cols-${args.cols}" id="loc-stat-row"></div>` : '<div class="stat-row" id="stat-row"></div>'); continue; }
    if (name === 'chart') { out.push(chartCard(args.id, args)); continue; }
    if (name === 'event-cards') { out.push(eventCardsHtml()); continue; }
    if (name === 'loc-table') { out.push(locTableHtml()); continue; }
    if (name === 'diagrams') { out.push(diagramsHtml()); continue; }
    if (name === 'thanks-wall') { /* handled when we hit the following paragraph */ out.push('__THANKS_WALL__'); continue; }
    if (name === 'year') { out.push(`<span class="year-anchor" data-year="${args.value}"></span>`); continue; }
    continue;
  }

  if (skipNext) { skipNext = false; continue; }

  if (out[out.length - 1] === '__THANKS_WALL__') {
    out[out.length - 1] = thanksWallHtml(trimmed);
    continue;
  }

  if (expectCommitLog && trimmed.startsWith('>')) {
    expectCommitLog = false;
    out.push(commitLogHtml(trimmed.split('\n')));
    continue;
  }

  const h1 = trimmed.match(/^# (.+)$/);
  if (h1) continue; // masthead H1 is fixed page chrome, not regenerated

  const h2 = trimmed.match(/^## (.+)$/);
  if (h2) {
    if (sectionOpen) out.push('</section>');
    const sec = SECTION_MAP[h2[1]];
    out.push(`<section data-rail-mode="${sec.mode}" id="${sec.id}">`);
    out.push(`<h2>${h2[1]}</h2>`);
    sectionOpen = true;
    continue;
  }

  const h3 = trimmed.match(/^### (.+)$/);
  if (h3) {
    const year = YEAR_MAP[h3[1]];
    out.push(year ? `<h3 data-year="${year}">${h3[1]}</h3>` : `<h3>${h3[1]}</h3>`);
    continue;
  }

  // dek: the very first real paragraph in the file (before section 1 opens) becomes the masthead dek
  if (dek === null && !sectionOpen) {
    dek = md.renderInline(trimmed.replace(/^\*(.+)\*$/s, '$1'));
    continue;
  }

  // images: a block of 2+ adjacent image lines (no blank line between them in
  // tortenet.md) renders as a side-by-side row instead of full-width stacked
  const imgLineRe = /^!\[(.*?)\]\((.*?)\)$/;
  const blockLines = trimmed.split('\n');
  if (blockLines.length > 1 && blockLines.every(l => imgLineRe.test(l))) {
    const items = blockLines.map(l => {
      const [, alt, src] = l.match(imgLineRe);
      let dims = '';
      if (src.endsWith('.png')) {
        const { width, height } = pngDims(src);
        dims = ` width="${width}" height="${height}"`;
      }
      return `<figure><img src="${src}" alt="${alt}"${dims}><figcaption class="img-cap">${alt}</figcaption></figure>`;
    });
    out.push(`<div class="img-row">\n  ${items.join('\n  ')}\n</div>`);
    continue;
  }

  // images: auto width/height for local pngs
  const imgMatch = trimmed.match(imgLineRe);
  if (imgMatch) {
    const [, alt, src] = imgMatch;
    let dims = '';
    if (src.endsWith('.png')) {
      const { width, height } = pngDims(src);
      dims = ` width="${width}" height="${height}"`;
    }
    out.push(`<img src="${src}" alt="${alt}"${dims}>\n  <p class="img-cap">${alt}</p>`);
    continue;
  }

  // suppressed tables (auto-generated content already injected via a directive above)
  if (trimmed.startsWith('|') && SUPPRESSED_TABLE_HEADERS.some(h => trimmed.startsWith(h))) {
    continue;
  }

  // stat-line class override
  if (nextPClass) {
    const cls = nextPClass; nextPClass = null;
    out.push(`<p class="${cls}">${md.renderInline(trimmed)}</p>`);
    continue;
  }

  // 2-line blockquote -> attrib span (matches index.html's existing convention)
  if (trimmed.startsWith('>')) {
    const rendered = md.render(block);
    const paras = [...rendered.matchAll(/<p>(.*?)<\/p>/gs)].map(m => m[1]);
    if (paras.length === 2) {
      out.push(`<blockquote>\n    ${paras[0]}\n    <span class="attrib">${paras[1]}</span>\n  </blockquote>`);
      continue;
    }
    out.push(rendered.trim());
    continue;
  }

  // everything else: plain markdown render (paragraphs, lists, tables, raw html)
  out.push(md.render(block).trim());
}
if (sectionOpen) out.push('</section>');

const articleInner = `  <div class="kicker">KSZK50 Prezentáció — teljes történet</div>
  <h1 class="title">AdminSCH története</h1>
  <p class="dek">${dek}</p>

  <hr>

${out.join('\n\n')}`;

// splice into the existing index.html shell (everything outside <article>...</article> is untouched)
const shellPath = path.join(DIR, 'index.html');
const shell = fs.readFileSync(shellPath, 'utf8');
const startTag = '<article>';
const endTag = '</article>';
const start = shell.indexOf(startTag);
const end = shell.indexOf(endTag);
if (start === -1 || end === -1) throw new Error('could not find <article>...</article> in index.html');

const newHtml = shell.slice(0, start + startTag.length) + '\n' + articleInner + '\n' + shell.slice(end);
fs.writeFileSync(shellPath, newHtml);
console.log('wrote index.html (article regenerated from tortenet.md)');

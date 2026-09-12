// Generates presentation.html — a click-through slide deck for the live KSZK50 talk.
// Reads data.js for every number/chart, so it never drifts from index.html's numbers.
// Slide content/copy is authored directly below (there's no markdown source for this
// one — it's a fixed script, not prose).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = __dirname;

function loadDataJs() {
  const src = fs.readFileSync(path.join(DIR, 'data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'data.js' });
  return sandbox;
}
const D = loadDataJs();

function loadThanksNames() {
  const md = fs.readFileSync(path.join(DIR, 'tortenet.md'), 'utf8');
  const m = md.match(/<!-- @thanks-wall -->\n(.+)/);
  if (!m) return [];
  return m[1].replace(/\.\s*$/, '').split(',').map(s => s.trim()).filter(Boolean);
}
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const THANKS_NAMES = shuffled(loadThanksNames());

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// ---- slide authoring -------------------------------------------------------
// type: title | text | image | commitlog | quote | statgrid | chart | closing
const S = [];
const title = (h, sub, note, noteLink) => S.push({ type: 'title', h, sub, note, noteLink });
const text = (h, sub, kicker, lines) => S.push({ type: 'text', h, sub, kicker, lines });
const image = (src, cap) => S.push({ type: 'image', src, cap });
const commitlog = (items) => S.push({ type: 'commitlog', items });
const quote = (q, by) => S.push({ type: 'quote', q, by });
const statgrid = (items) => S.push({ type: 'statgrid', items });
const chart = (kind, h) => S.push({ type: 'chart', kind, h });
const closing = (h, sub, names) => S.push({ type: 'closing', h, sub, names });
// tags the just-authored slide with its position on the bottom rail's
// year-scale (2013–2026); slides with no atYear() leave the rail marker
// wherever the previous dated slide left it — see updateRailMarker()
const atYear = (y) => { S[S.length - 1].year = y; };
let railStartIndex = 0;
const railStartsHere = () => { railStartIndex = S.length - 1; };

title('AdminSCH', 'Több mint 13 év története', 'A teljes anyag itt is elérhető: ', 'adminsch.lasz.io');

text('Rólam', 'Rafael László — Lackó / rlacko', 'KSZK 2018 óta', [
  'VMWare Rendszergazda · Devteam körvezető · Főmentor · K8S Rendszergazda',
  '2022–2026: Dánia (Devoteam → Trackman) · most: Bitrise',
]);
image('assets/adminsch-draft-1.png');
image('assets/adminsch-draft-2.png');

text('Legalább 500 új diák.', 'Minden évben.', 'A kihívás');
image('assets/kszk-2025.png');

text('2013', 'amit örököltem', null); atYear(2013.0);
image('assets/admintools.png', 'Admintools, 2000-es évek'); atYear(2013.0);
text('Zolij', '2013. február 11.', null); atYear(2013.1); railStartsHere();
image('assets/adminsch-old-error.png'); atYear(2013.15);
statgrid([{ big: '1235', small: 'commit' }, { big: 'évekig', small: 'gyakorlatilag egyedül' }]); atYear(2016);

text('2015–2019', 'az újraírási kísérletek', null); atYear(2015.2);
commitlog([
  { name: 'Madarász Bence', date: '2019. április 4.', subject: 'price on networkRegistration.php form final5' },
  { name: 'Madarász Bence', date: '2019. április 4.', subject: 'price on networkRegistration.php form final4' },
  { name: 'Madarász Bence', date: '2019. április 4.', subject: 'price on networkRegistration.php form final3' },
  { name: 'Madarász Bence', date: '2019. április 4.', subject: "Merge remote-tracking branch 'origin/bmejegy' into bmejegy" },
  { name: 'Madarász Bence', date: '2019. április 4.', subject: 'price on networkRegistration.php form final2' },
]); atYear(2019.25);

text('2019', 'Márki-Zay Feri, Kiss Tomi, Pünkösd Marcell — mikroszolgáltatások', null); atYear(2019.5);
image('assets/arch-v1.png'); atYear(2019.6);

text('2020–2021', 'a projekt lassú halála', null); atYear(2020.2);
statgrid([{ big: '727', small: '2020' }, { big: '92', small: '2021' }]); atYear(2020.5);

text('2021', 'Akkor vége?', null); atYear(2021.3);
image('assets/this-is-fine.gif'); atYear(2021.5);
text('AdminSCH::Code', 'Hackathon', null, ['Marcselló & Adrián']); atYear(2022.1);
image('assets/adminsch_code_1.png', 'AdminSCH::Code Vol. 1 — 2022. március 19.'); atYear(2022.21);

text('2022. június 25.', 'AdminSCH::Code', null); atYear(2022.48);
image('assets/adminsch_code_2.png'); atYear(2022.48);
image('assets/adminsch_code_2_fun.png', 'Kacsák!'); atYear(2022.49);
image('assets/network-diagram.png', 'RADIUS, DHCP, VLAN-service és a switchek'); atYear(2022.5);

text('2022. augusztus 1.', '01:26 — átálltunk', null); atYear(2022.58);
image('assets/adminsch_code_3_koccint.png'); atYear(2022.58);
image('assets/adminsch_code_3_circle.png'); atYear(2022.58);

text('2022 vége – 2023', 'finomítás, stabilizálás, sztenderdizálás', null); atYear(2022.9);

text('2024–2026', 'a stafétabot', null); atYear(2024.1);
text('schaccreg', 'végre önkiszolgáló regisztráció', null); atYear(2024.62);
text('sch-natgw-sync', 'a NAT-probléma is megoldva', null); atYear(2026.05);

text('A történet nem állt meg.', null, null); atYear(2026.5);

// ---- stats -----------------------------------------------------------------
statgrid([
  { big: D.META.totalCommits.toLocaleString('hu-HU'), small: 'commit' },
  { big: D.META.totalContributors, small: 'közreműködő' },
  { big: D.META.totalRepos, small: 'repó' },
  { big: '13', small: 'év' },
]);
chart('yearly', 'Commitok évente');
chart('people', 'Kik csinálták');
chart('category', '73 repó, hat kategória');
statgrid([{ big: '34', small: 'archivált repó — lezárt fejezetek, nem hibák' }]);
chart('releases', '992 kiadás, 2019–2026');

closing('Köszönöm.', 'Kérdések?', THANKS_NAMES);

// ---- render ------------------------------------------------------------------
function renderSlide(s, i) {
  if (s.type === 'title') {
    return `<section class="slide slide-title"><h1>${esc(s.h)}</h1><p class="sub">${esc(s.sub || '')}</p>${s.note ? `<p class="note">${esc(s.note)}${s.noteLink ? `<b>${esc(s.noteLink)}</b>` : ''}</p>` : ''}</section>`;
  }
  if (s.type === 'text') {
    return `<section class="slide slide-text">
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ''}
      <h2>${esc(s.h)}</h2>
      ${s.sub ? `<p class="sub">${esc(s.sub)}</p>` : ''}
      ${(s.lines || []).map(l => `<p class="line">${esc(l)}</p>`).join('\n')}
    </section>`;
  }
  if (s.type === 'image') {
    return `<section class="slide slide-image">
      <img src="${esc(s.src)}" alt="${esc(s.cap || '')}">
      ${s.cap ? `<div class="cap">${esc(s.cap)}</div>` : ''}
    </section>`;
  }
  if (s.type === 'commitlog') {
    const rows = s.items.map(it => {
      const initials = it.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
      return `<div class="commit-row">
        <div class="commit-avatar">${esc(initials)}</div>
        <div class="commit-body">
          <div class="commit-subject">${esc(it.subject)}</div>
          <div class="commit-meta">${esc(it.name)} · ${esc(it.date)}</div>
        </div>
      </div>`;
    }).join('\n');
    return `<section class="slide slide-commitlog"><div class="commit-list">${rows}</div></section>`;
  }
  if (s.type === 'quote') {
    return `<section class="slide slide-quote">
      <blockquote>„${esc(s.q)}”</blockquote>
      <div class="by">— ${esc(s.by)}</div>
    </section>`;
  }
  if (s.type === 'statgrid') {
    const items = s.items.map(it => `<div class="stat"><div class="big">${esc(it.big)}</div><div class="small">${esc(it.small)}</div></div>`).join('\n');
    return `<section class="slide slide-stats"><div class="stat-grid cols-${s.items.length}">${items}</div></section>`;
  }
  if (s.type === 'chart') {
    return `<section class="slide slide-chart" data-chart="${s.kind}">
      <h3>${esc(s.h)}</h3>
      <div class="chart-body" id="chart-${i}"></div>
    </section>`;
  }
  if (s.type === 'closing') {
    const names = s.names || [];
    const chips = names.map((n, ni) => `<span class="name-chip s${(ni % 8) + 1}">${esc(n)}</span>`).join('');
    // the track holds the chip grid 3x back-to-back so the -33.3333% keyframe
    // loops seamlessly (see the CSS comment above .name-scroll)
    const dur = Math.max(30, Math.round(names.length * 0.8));
    const scroll = names.length ? `<div class="name-scroll"><div class="name-scroll-track" style="animation-duration:${dur}s">
      <div class="name-wall">${chips}</div><div class="name-wall">${chips}</div><div class="name-wall">${chips}</div>
    </div></div>` : '';
    return `<section class="slide slide-closing"><h1>${esc(s.h)}</h1><p class="sub">${esc(s.sub || '')}</p>${scroll}</section>`;
  }
  return '';
}

const slidesHtml = S.map((s, i) => {
  const html = renderSlide(s, i);
  return s.year != null ? html.replace('<section class="slide', `<section data-year="${s.year}" class="slide`) : html;
}).join('\n');

const page = `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AdminSCH — előadás</title>
<link rel="icon" href="assets/favicon.ico">
<style>
  :root{
    color-scheme: light;
    --page:#f9f9f7; --surface-1:#fcfcfb; --text-primary:#0b0b0b; --text-secondary:#52514e;
    --text-muted:#898781; --gridline:#e1e0d9; --border:rgba(11,11,11,0.10); --accent:#2a78d6;
    --s1:#2a78d6; --s2:#eb6834; --s3:#1baf7a; --s4:#eda100; --s5:#e87ba4; --s6:#008300; --s7:#4a3aa7; --s8:#e34948;
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      color-scheme: dark;
      --page:#0d0d0d; --surface-1:#1a1a19; --text-primary:#ffffff; --text-secondary:#c3c2b7;
      --text-muted:#898781; --gridline:#2c2c2a; --border:rgba(255,255,255,0.10); --accent:#3987e5;
      --s1:#3987e5; --s2:#d95926; --s3:#199e70; --s4:#c98500; --s5:#d55181; --s6:#008300; --s7:#9085e9; --s8:#e66767;
    }
  }
  :root[data-theme="dark"]{
    color-scheme: dark;
    --page:#0d0d0d; --surface-1:#1a1a19; --text-primary:#ffffff; --text-secondary:#c3c2b7;
    --text-muted:#898781; --gridline:#2c2c2a; --border:rgba(255,255,255,0.10); --accent:#3987e5;
    --s1:#3987e5; --s2:#d95926; --s3:#199e70; --s4:#c98500; --s5:#d55181; --s6:#008300; --s7:#9085e9; --s8:#e66767;
  }
  *{ box-sizing:border-box; }
  html,body{ height:100%; margin:0; overflow:hidden; background:var(--page); color:var(--text-primary);
    font-family:system-ui,-apple-system,"Segoe UI",sans-serif; }
  #deck{ position:relative; width:100vw; height:100vh; cursor:pointer; }
  .slide{
    position:absolute; inset:0; display:none; flex-direction:column; align-items:center; justify-content:center;
    text-align:center; padding:6vh 8vw;
  }
  .slide.active{ display:flex; }

  .slide-title h1{ font-size:clamp(48px,9vw,140px); margin:0; letter-spacing:-0.02em; font-weight:800; }
  .slide-title .sub{ font-size:clamp(18px,2.6vw,32px); color:var(--text-secondary); margin-top:18px; }
  .slide-title .note{ font-size:clamp(22px,3vw,40px); color:var(--text-secondary); font-weight:400; margin-top:44px; }
  .slide-title .note b{ font-weight:700; color:var(--text-primary); }

  #backlink{
    position:fixed; top:22px; left:26px; font-size:13px; color:var(--text-muted);
    z-index:25; opacity:.6; text-decoration:none; transition:opacity .15s ease;
  }
  #backlink:hover{ opacity:1; }

  #themeBtn{
    position:fixed; top:18px; right:26px; z-index:25; font-size:20px;
    background:none; border:none; cursor:pointer; opacity:.6; transition:opacity .15s ease;
    line-height:1; padding:4px;
  }
  #themeBtn:hover{ opacity:1; }

  /* closing slide: pure CSS (flex-wrap + clamp + %-based keyframe), no fixed
     pixel sizing, so the credits roll reflows correctly on any resize/screen
     size without needing JS to redraw it. The name list is tripled in the HTML
     and the track scrolls exactly -33.3333% — since all three copies are
     identical, that point looks identical to 0% and the loop is seamless.
     height is capped at content height (JS-measured, see below) rather than
     a fixed vh: on wide/fullscreen screens the chips wrap into fewer rows, so
     a fixed vh box would be taller than the content and show blank space
     before the next copy scrolls into view. */
  .slide-closing{ padding:5vh 5vw 166px; }
  .slide-closing h1{ font-size:clamp(40px,6vw,84px); margin:0; font-weight:800; letter-spacing:-0.02em; }
  .slide-closing .sub{ font-size:clamp(16px,2vw,26px); color:var(--text-secondary); margin-top:12px; }
  .name-scroll{
    width:94vw; height:min(46vh, var(--name-wall-h, 46vh)); margin-top:3vh; overflow:hidden; contain:strict;
    -webkit-mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
    mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
  }
  /* gap here (not padding on .name-wall) keeps the seam between the
     duplicated copies at the same rhythm as every other row. will-change
     promotes the track to its own GPU layer so the scroll doesn't force a
     repaint of the mask / rest of the page on every frame. duration is set
     inline per-slide (proportional to name count) so pace stays constant
     how ever many names there are. */
  /* the loop must shift by EXACTLY one copy's rendered height + the 8px row
     gap, not an approximate -33.3333%: with a fixed % of the 3-copy track
     the 8px gaps don't scale the same way, so % undershoots the real seam by
     a constant ~2.7px every loop. Driving the transform off the same
     --name-wall-h var used for sizing keeps the seam exact regardless of
     content height. */
  .name-scroll-track{ display:flex; flex-direction:column; gap:8px; will-change:transform; animation-name:name-scroll; animation-timing-function:linear; animation-iteration-count:infinite; }
  .name-wall{ display:flex; flex-wrap:wrap; gap:8px 10px; justify-content:center; }
  @keyframes name-scroll{ from{ transform:translateY(0); } to{ transform:translateY(calc(-1 * (var(--name-wall-h, 0px) + 8px))); } }
  .name-chip{
    font-size:clamp(11px,1.05vw,14px); padding:5px 13px; border-radius:999px;
    border:1px solid currentColor; opacity:.8; white-space:nowrap;
  }
  .name-chip:hover{ opacity:1; }
  .name-chip.s1{ color:var(--s1); } .name-chip.s2{ color:var(--s2); } .name-chip.s3{ color:var(--s3); }
  .name-chip.s4{ color:var(--s4); } .name-chip.s5{ color:var(--s5); } .name-chip.s6{ color:var(--s6); }
  .name-chip.s7{ color:var(--s7); } .name-chip.s8{ color:var(--s8); }

  .slide-text .kicker{ text-transform:uppercase; letter-spacing:.12em; font-size:clamp(13px,1.4vw,18px); color:var(--accent); font-weight:700; margin-bottom:18px; }
  .slide-text h2{ font-size:clamp(40px,7vw,110px); margin:0; letter-spacing:-0.02em; font-weight:800; }
  .slide-text .sub{ font-size:clamp(18px,2.8vw,36px); color:var(--text-secondary); margin-top:16px; font-weight:400; }
  .slide-text .line{ font-size:clamp(15px,1.9vw,26px); color:var(--text-muted); margin:6px 0 0; font-weight:400; }

  /* bottom padding reserves room for the bottom rail (150px) so the image+caption
     group — centered within this now-shorter box — never renders under it, even
     though the rail is only visible from the Zolij slide onward */
  .slide-image{ padding:4vh 4vw 166px; }
  .slide-image img{ max-width:92vw; max-height:68vh; object-fit:contain; border-radius:14px; box-shadow:0 20px 60px rgba(0,0,0,0.35); }
  .slide-image .cap{ margin-top:20px; font-size:clamp(14px,1.6vw,22px); color:var(--text-muted); }


  .slide-quote blockquote{ font-size:clamp(28px,5vw,64px); font-weight:700; margin:0; max-width:80vw; letter-spacing:-0.01em; font-style:italic; }
  .slide-quote .by{ margin-top:24px; font-size:clamp(16px,2vw,26px); color:var(--text-muted); }

  .commit-list{ width:min(78vw,900px); text-align:left; }
  .commit-row{ display:flex; gap:22px; align-items:flex-start; padding:18px 0; border-bottom:1px solid var(--border); }
  .commit-row:last-child{ border-bottom:none; }
  .commit-avatar{
    flex:none; width:52px; height:52px; border-radius:50%;
    background:var(--s7); color:#fff; display:flex; align-items:center; justify-content:center;
    font-size:19px; font-weight:700;
  }
  .commit-body{ min-width:0; }
  .commit-subject{ font-size:clamp(18px,2.4vw,28px); font-weight:600; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
  .commit-meta{ font-size:clamp(13px,1.5vw,18px); color:var(--text-muted); margin-top:4px; }

  .stat-grid{ display:grid; gap:48px 64px; }
  .stat-grid.cols-1{ grid-template-columns:1fr; max-width:60vw; }
  .stat-grid.cols-2{ grid-template-columns:repeat(2,1fr); }
  .stat-grid.cols-4{ grid-template-columns:repeat(2,1fr); }
  .stat .big{ font-size:clamp(56px,10vw,150px); font-weight:800; letter-spacing:-0.03em; color:var(--accent); line-height:1; }
  .stat .small{ font-size:clamp(16px,2vw,28px); color:var(--text-secondary); margin-top:10px; }

  /* same rail-clearance reasoning as .slide-image: reserve room at the bottom
     so the chart never renders under the bottom rail */
  .slide-chart{ padding:5vh 5vw 166px; }
  .slide-chart h3{ font-size:clamp(28px,4.5vw,56px); margin:0 0 3vh; font-weight:800; letter-spacing:-0.02em; }
  .chart-body{ width:88vw; height:52vh; }
  .bar-label{ font-size:20px; fill:var(--text-secondary); font-family:inherit; }
  .bar-value{ font-size:20px; fill:var(--text-primary); font-weight:700; font-family:inherit; }
  .axis-label{ font-size:16px; fill:var(--text-muted); font-family:inherit; }

  #hud{ position:fixed; bottom:8px; right:26px; font-size:14px; color:var(--text-muted); font-variant-numeric:tabular-nums;
    z-index:25; pointer-events:none; }
  #navhint{ position:fixed; bottom:8px; left:26px; font-size:12px; color:var(--text-muted); opacity:.55; z-index:25; pointer-events:none; }

  #bottom-rail{
    /* contributor colors stay fixed regardless of page theme, so the histogram
       always reads the same; the background itself is NOT overridden — it
       inherits the page's own var(--page), tinted+blurred for a glass feel */
    --s1:#3987e5; --s2:#d95926; --s3:#199e70; --s4:#c98500; --s5:#d55181; --s6:#3fae3f; --s7:#9085e9; --s8:#e66767;
    --other:#4a4a47;
    position:fixed; left:0; right:0; bottom:0; height:150px; z-index:20;
    background: color-mix(in srgb, var(--page) 55%, transparent);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    opacity:0; pointer-events:none; transition: opacity .4s ease;
  }
  #bottom-rail.show{ opacity:1; pointer-events:auto; }
  #rail-svg{ width:100%; height:100%; display:block; }
  .rail-dot{ fill:#ffffff; stroke:#000; stroke-width:1; cursor:pointer; opacity:.9; }
  .rail-gridline{ stroke:var(--text-muted); stroke-width:1; opacity:.2; }
  .rail-year-label{ font-size:9px; fill:var(--text-muted); font-family:inherit; opacity:.7; }
  .rail-dot:hover{ opacity:1; r:7; }
  .rail-marker{ fill:var(--text-primary); opacity:0; transition:opacity .2s ease; filter:drop-shadow(0 0 3px rgba(255,255,255,.6)); }

  .tooltip{
    position:fixed; pointer-events:none; z-index:90;
    background:var(--text-primary); color:var(--page);
    font-size:13px; padding:6px 10px; border-radius:7px;
    line-height:1.4; opacity:0; transform:translateY(4px);
    transition:opacity .1s ease, transform .1s ease;
    max-width:260px;
  }
  .tooltip.show{ opacity:1; transform:translateY(0); }
</style>
</head>
<body>
<a id="backlink" href="index.html">← Vissza a főoldalra</a>
<button id="themeBtn" aria-label="Téma váltása"></button>
<script>
(function(){
  const themeBtn = document.getElementById('themeBtn');
  function applyTheme(t){
    if(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem('adminsch-theme', t); }
    else{ document.documentElement.removeAttribute('data-theme'); localStorage.removeItem('adminsch-theme'); }
    const isDark = t ? t==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  }
  applyTheme(localStorage.getItem('adminsch-theme') || null);
  themeBtn.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const isDarkNow = cur ? cur==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(isDarkNow ? 'light' : 'dark');
  });
})();
</script>
<div id="deck">
${slidesHtml}
</div>
<div id="bottom-rail">
  <svg id="rail-svg"></svg>
</div>
<div id="hud"></div>
<div id="navhint">click / → tovább · ← vissza · f teljes képernyő</div>
<div class="tooltip" id="tooltip"></div>
<script src="data.js"></script>
<script>
(function(){
  const slides = Array.from(document.querySelectorAll('.slide'));
  const hud = document.getElementById('hud');
  const bottomRail = document.getElementById('bottom-rail');
  const RAIL_START = ${railStartIndex};
  let i = 0;
  function render(){
    slides.forEach((s,idx)=> s.classList.toggle('active', idx===i));
    hud.textContent = (i+1) + ' / ' + slides.length;
    drawChartIfNeeded(slides[i]);
    updateRailMarker(slides[i]);
    bottomRail.classList.toggle('show', i >= RAIL_START);
    sizeNameScroll();
  }

  // Several independent triggers, all cheap and all calling the same
  // synchronous measurement, so no single missed event (a fullscreen
  // transition with no resize event, a webfont swapping in late, a resize
  // observer callback getting throttled in a background tab) can leave
  // --name-wall-h stale and reopen the gap.
  const nameWall = document.querySelector('.name-wall');
  const nameScroll = document.querySelector('.name-scroll');
  function sizeNameScroll(){
    if(!nameWall || !nameScroll) return;
    const h = nameWall.getBoundingClientRect().height;
    if(h > 0) nameScroll.style.setProperty('--name-wall-h', h + 'px');
  }
  if(nameWall && nameScroll){
    new ResizeObserver(sizeNameScroll).observe(nameWall);
    document.fonts && document.fonts.ready.then(sizeNameScroll);
    document.addEventListener('fullscreenchange', ()=>{
      sizeNameScroll();
      requestAnimationFrame(()=> requestAnimationFrame(sizeNameScroll));
    });
  }

  function next(){ if(i < slides.length-1){ i++; render(); } }
  function prev(){ if(i > 0){ i--; render(); } }

  document.getElementById('deck').addEventListener('click', next);
  window.addEventListener('keydown', (e)=>{
    if(['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)){ e.preventDefault(); next(); }
    else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)){ e.preventDefault(); prev(); }
    else if(e.key === 'Home'){ i=0; render(); }
    else if(e.key === 'End'){ i=slides.length-1; render(); }
    else if(e.key === 'f'){ document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
  });

  const drawn = new Set();
  function drawChartIfNeeded(slide){
    if(slide.dataset.chart === undefined) return;
    const body = slide.querySelector('.chart-body');
    if(!body || drawn.has(body.id)) return;
    drawn.add(body.id);
    drawChart(slide.dataset.chart, body);
  }

  function svgEl(tag, attrs){
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for(const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function barChart(container, data, opts){
    // data: [{label, value, color}], horizontal bars, biggest first
    opts = opts || {};
    const w = container.clientWidth, h = container.clientHeight;
    const svg = svgEl('svg', {viewBox:\`0 0 \${w} \${h}\`, width:'100%', height:'100%'});
    // narrow containers (phones) get a bigger label share AND a smaller font,
    // so long Hungarian names never clip off the left edge of the chart
    const narrow = w < 600;
    const fontSize = Math.max(11, Math.min(20, w/28));
    const labelW = opts.labelW || Math.min(320, w*(narrow ? 0.44 : 0.32));
    const max = Math.max(...data.map(d=>d.value));
    const rowH = h / data.length;
    const barH = Math.min(rowH*0.55, 56);
    data.forEach((d,i)=>{
      const y = i*rowH + (rowH-barH)/2;
      const bw = (w - labelW - 90) * (d.value/max);
      const lbl = svgEl('text', {x:labelW-16, y:y+barH*0.68, class:'bar-label', 'text-anchor':'end', style:\`font-size:\${fontSize}px\`});
      lbl.textContent = d.label; svg.appendChild(lbl);
      svg.appendChild(svgEl('rect', {x:labelW, y, width:Math.max(bw,2), height:barH, rx:8, fill:d.color||'var(--accent)'}));
      const val = svgEl('text', {x:labelW+bw+14, y:y+barH*0.68, class:'bar-value', style:\`font-size:\${fontSize}px\`});
      val.textContent = d.value.toLocaleString('hu-HU'); svg.appendChild(val);
    });
    container.appendChild(svg);
  }

  function columnChart(container, data, opts){
    // data: [{label, value}], vertical columns left-to-right
    const w = container.clientWidth, h = container.clientHeight;
    const svg = svgEl('svg', {viewBox:\`0 0 \${w} \${h}\`, width:'100%', height:'100%'});
    const max = Math.max(...data.map(d=>d.value));
    const padL = 10, padB = 50, padT = 30;
    const colW = (w - padL*2) / data.length;
    const barW = Math.min(colW*0.55, 90);
    // shrink label/value text on narrow containers (phones) so adjacent
    // columns' numbers never overlap each other; if there still isn't room
    // for every year label at a readable size, show every other one instead
    // of shrinking further into illegibility
    const fontSize = Math.max(10, Math.min(20, colW/2.6));
    const labelStep = colW < 34 ? 2 : 1;
    data.forEach((d,i)=>{
      const bh = (h-padB-padT) * (d.value/max);
      const x = padL + i*colW + (colW-barW)/2;
      const y = h - padB - bh;
      svg.appendChild(svgEl('rect', {x, y, width:barW, height:bh, rx:6, fill: d.color || 'var(--accent)'}));
      const val = svgEl('text', {x:x+barW/2, y:y-10, class:'bar-value', 'text-anchor':'middle', style:\`font-size:\${fontSize}px\`});
      val.textContent = d.value.toLocaleString('hu-HU'); svg.appendChild(val);
      if(i % labelStep === 0){
        const lbl = svgEl('text', {x:x+barW/2, y:h-padB+26, class:'axis-label', 'text-anchor':'middle', style:\`font-size:\${fontSize}px\`});
        lbl.textContent = d.label; svg.appendChild(lbl);
      }
    });
    container.appendChild(svg);
  }

  function drawChart(kind, container){
    if(kind === 'yearly'){
      columnChart(container, YEARLY.map(y=>({label:y.year, value:y.commits})));
    } else if(kind === 'people'){
      const top = LEADERBOARD.filter(d=>!d.other).slice(0,16);
      barChart(container, top.map((d,i)=>({label:d.name.replace(' (én)',''), value:d.total, color:'var(--'+SERIES[i%SERIES.length].slice(2)+')'})));
    } else if(kind === 'category'){
      const cats = {};
      TIMELINE.forEach(([repo,cat])=> cats[cat]=(cats[cat]||0)+1);
      const order = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
      const colors = ['var(--s1)','var(--s2)','var(--s3)','var(--s4)','var(--s5)','var(--s6)','var(--s7)','var(--s8)'];
      barChart(container, order.map(([label,value],i)=>({label, value, color:colors[i%colors.length]})));
    } else if(kind === 'releases'){
      columnChart(container, RELEASES.map(r=>({label:r.year, value:r.tags})));
    }
  }

  /* ---- bottom rail: yearly commit histogram + initiative dots + position marker ---- */
  const tooltip = document.getElementById('tooltip');
  function showTip(html, x, y){
    tooltip.innerHTML = html;
    tooltip.classList.add('show');
    const margin = 10;
    const w = tooltip.offsetWidth, h = tooltip.offsetHeight;
    let left = x + 14, top = y - h - 14;
    if(left + w > window.innerWidth - margin) left = x - w - 14;
    if(top < margin) top = y + 14;
    left = Math.max(margin, Math.min(left, window.innerWidth - w - margin));
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }
  function hideTip(){ tooltip.classList.remove('show'); }

  const RAIL_MIN_YEAR = 2013, RAIL_MAX_YEAR = 2026.75;
  const RAIL_PNAMES = ['zolij','Márki-Zay Ferenc','Laszlo Rafael','Tamas Kiss','Bence Orosz','Pomucz Tamás','Wendl Lili'];
  function railX(y, w){ return (y - RAIL_MIN_YEAR) / (RAIL_MAX_YEAR - RAIL_MIN_YEAR) * w; }
  function toDecYear(dateStr){
    const [y,m,d] = dateStr.split('-').map(Number);
    return y + ((m||1)-1)/12 + (d||15)/365;
  }
  function ymToDec(ym){ const [y,m] = ym.split('-').map(Number); return y + (m-1)/12; }

  let railMarker = null;
  function buildRail(){
    const el = document.getElementById('rail-svg');
    const w = el.parentElement.clientWidth, h = el.parentElement.clientHeight;
    const svg = svgEl('svg', {viewBox:\`0 0 \${w} \${h}\`, width:'100%', height:'100%'});

    // extra 14px strip carved out below the bars, above the hud/navhint text
    // row, just for the year gridlines + tiny year numbers — keeping it out
    // of the same horizontal band as that text avoids any overlap with it
    const dotY = 14, barBase = h - 44, barMaxH = barBase - dotY - 4, yearLabelY = h - 30;
    const maxMonth = Math.max(...MONTHLY.map(d=>d[1]));
    const barW = Math.max(1.5, (w / MONTHLY.length) * 0.6);

    for(let y=2013; y<=2026; y++){
      const x = railX(y, w);
      svg.appendChild(svgEl('line', {x1:x, x2:x, y1:dotY+10, y2:barBase, class:'rail-gridline'}));
      // the 2013 line sits exactly at x=0 — center-anchoring its label would
      // clip half of it off the left edge of the svg, so anchor from start
      const anchor = x < 12 ? 'start' : (x > w-12 ? 'end' : 'middle');
      const lbl = svgEl('text', {x, y:yearLabelY, class:'rail-year-label', 'text-anchor':anchor});
      lbl.textContent = "'" + String(y).slice(2);
      svg.appendChild(lbl);
    }

    MONTHLY.forEach(([ym, total, dist, other])=>{
      const x = railX(ymToDec(ym), w);
      const bh = total>0 ? Math.max(2, Math.sqrt(total/maxMonth)*barMaxH) : 0;
      let cy = barBase;
      dist.forEach((val, gi)=>{
        if(val<=0) return;
        const segH = (val/total)*bh;
        cy -= segH;
        svg.appendChild(svgEl('rect', {
          x: x-barW/2, y:cy, width:barW, height:segH+0.5,
          fill: gi<7 ? \`var(--s\${gi+1})\` : 'var(--other)'
        }));
      });
      if(total>0){
        const named = dist.slice(0,7).map((v,gi)=> v>0 ? [RAIL_PNAMES[gi], v] : null).filter(Boolean);
        const all = named.concat(other).sort((a,b)=> b[1]-a[1]);
        const lines = all.map(([n,v])=> \`\${n}: \${v}\`);
        const hover = svgEl('rect', {x:x-barW/2-1, y:0, width:barW+2, height:h, fill:'transparent'});
        hover.addEventListener('mousemove', (e)=> showTip(\`<b>\${ym}</b> · \${total} commit\${lines.length?'<br><span style="opacity:.75">'+lines.join('<br>')+'</span>':''}\`, e.clientX, e.clientY));
        hover.addEventListener('mouseleave', hideTip);
        svg.appendChild(hover);
      }
    });

    INITIATIVES.forEach(ev=>{
      const x = railX(toDecYear(ev.start), w);
      const dot = svgEl('circle', {cx:x, cy:dotY, r:5, class:'rail-dot'});
      dot.addEventListener('mouseenter', (e)=> showTip(\`<b>\${ev.name}</b>\`, e.clientX, e.clientY));
      dot.addEventListener('mousemove', (e)=> showTip(\`<b>\${ev.name}</b>\`, e.clientX, e.clientY));
      dot.addEventListener('mouseleave', hideTip);
      svg.appendChild(dot);
    });

    railMarker = svgEl('rect', {x:0, y:0, width:3, height:h, class:'rail-marker'});
    svg.appendChild(railMarker);

    el.replaceWith(svg);
    svg.id = 'rail-svg';
  }

  function updateRailMarker(slide){
    if(!railMarker) return;
    const y = slide.dataset.year;
    if(y === undefined){ railMarker.style.opacity = 0; return; }
    const w = railMarker.ownerSVGElement.clientWidth;
    const x = railX(parseFloat(y), w);
    railMarker.setAttribute('x', x - 1.5);
    railMarker.style.opacity = 1;
  }

  buildRail();
  render();

  let resizeTimer;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{ buildRail(); updateRailMarker(slides[i]); sizeNameScroll(); }, 150);
  });
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(DIR, 'presentation.html'), page);
console.log('wrote presentation.html —', S.length, 'slides');

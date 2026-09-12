// Renders tortenet.md -> tortenet.html using markdown-it (html:true, so the
// <span data-stat="..."> placeholders and the closing <script> survive into
// the output untouched) and wires up data.js so the numbers stay live.
//
// Also rewrites the leaderboard table inside tortenet.md itself from the
// same LEADERBOARD array, so the source .md stays correct even when just
// read as plain text — run `npm run build` again after editing data.js.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const MarkdownIt = require('markdown-it');

const DIR = __dirname;

function loadDataJs() {
  const src = fs.readFileSync(path.join(DIR, 'data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'data.js' });
  return sandbox;
}

function renderLeaderboardTable(LEADERBOARD) {
  const rows = LEADERBOARD.map(d => {
    const name = d.other ? `*${d.name}*` : d.name;
    return `| ${name} | ${d.total} |`;
  });
  return ['| Közreműködő | Összes commit |', '|---|---:|', ...rows].join('\n');
}

function replaceLeaderboardTable(md, table) {
  const start = md.indexOf('| Közreműködő | Összes commit |');
  if (start === -1) throw new Error('leaderboard table not found in tortenet.md');
  const afterHeader = md.indexOf('\n', start) + 1;
  const afterDivider = md.indexOf('\n', afterHeader) + 1;
  let end = afterDivider;
  while (end < md.length && md[end] === '|') {
    end = md.indexOf('\n', end) + 1;
  }
  return md.slice(0, start) + table + '\n' + md.slice(end);
}

const data = loadDataJs();
let md = fs.readFileSync(path.join(DIR, 'tortenet.md'), 'utf8');
md = replaceLeaderboardTable(md, renderLeaderboardTable(data.LEADERBOARD));
fs.writeFileSync(path.join(DIR, 'tortenet.md'), md);

const mdit = new MarkdownIt({ html: true, linkify: true, typographer: true });
const bodyHtml = mdit.render(md);

const page = `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AdminSCH története — sztori</title>
<style>
  :root{
    --page:#f9f9f7; --surface-1:#fcfcfb; --text-primary:#0b0b0b; --text-secondary:#52514e;
    --text-muted:#898781; --gridline:#e1e0d9; --border:rgba(11,11,11,0.10); --accent:#2a78d6;
  }
  @media (prefers-color-scheme: dark){
    :root{
      --page:#0d0d0d; --surface-1:#1a1a19; --text-primary:#ffffff; --text-secondary:#c3c2b7;
      --text-muted:#898781; --gridline:#2c2c2a; --border:rgba(255,255,255,0.10); --accent:#3987e5;
    }
  }
  *{ box-sizing:border-box; }
  body{
    background:var(--page); color:var(--text-primary);
    font-family:system-ui,-apple-system,"Segoe UI",sans-serif; line-height:1.65;
    max-width:740px; margin:0 auto; padding:48px 24px 100px;
  }
  h1{ font-size:clamp(28px,5vw,40px); letter-spacing:-0.01em; }
  h2,h3{ letter-spacing:-0.01em; margin-top:2.2em; }
  a{ color:var(--accent); }
  table{ width:100%; border-collapse:collapse; margin:24px 0; font-size:15px; }
  th,td{ text-align:left; padding:9px 12px; border-bottom:1px solid var(--gridline); }
  th{ color:var(--text-muted); font-weight:600; font-size:13px; text-transform:uppercase; letter-spacing:.03em; }
  td:last-child, th:last-child{ text-align:right; font-variant-numeric:tabular-nums; }
  tr:last-child td{ font-style:italic; color:var(--text-secondary); }
  code{ background:var(--surface-1); border:1px solid var(--border); border-radius:4px; padding:1px 5px; font-size:0.92em; }
</style>
</head>
<body>
${bodyHtml}
<script src="data.js"></script>
<script>
document.querySelectorAll('[data-stat]').forEach(el=>{
  const v = META[el.dataset.stat];
  if(v != null) el.textContent = v.toLocaleString('hu-HU');
});
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(DIR, 'tortenet.html'), page);
console.log('wrote tortenet.html and refreshed the leaderboard table in tortenet.md');

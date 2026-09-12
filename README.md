# AdminSCH — KSZK50 prezentáció

A history of AdminSCH (KSZK's student-run admin system), told two ways from a single source.

**Live:** https://adminsch.lasz.io

## Files

- `tortenet.md` — single source of truth, plain-prose story with directive comments (`<!-- @chart ... -->` etc.)
- `data.js` — shared stats/chart data, read by every generator below
- `build-index.js` → `index.html` — the full interactive article (charts, diagrams, timeline)
- `build-tortenet.js` → `tortenet.html` — plain reading version of the story
- `build-presentation.js` → `presentation.html` — click-through slide deck for the live talk
- `assets/` — images, gifs, `.drawio` architecture diagrams, vendored draw.io viewer

## Building

```
node build-index.js
node build-tortenet.js
node build-presentation.js
```

Each script reads `tortenet.md`/`data.js` and regenerates its corresponding `.html` file. Edit the source, not the generated HTML.

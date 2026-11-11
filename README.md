# DetectAI — Frontend AI Content Detector

A polished, **client-only** AI content detection platform built with React + Vite + Tailwind CSS.

No backend. No database. No API keys.  
Auth, history, and analysis all run in the browser via `localStorage` + a stylometric heuristic engine.

Ideal as a **frontend portfolio project** or static demo.

---

## Tech stack

| Layer        | Choice                                      |
|--------------|---------------------------------------------|
| Framework    | React 18 + Vite                             |
| Styling      | Tailwind CSS + CSS variables (6 themes)     |
| Routing      | React Router v6                             |
| Charts       | Recharts                                    |
| Icons        | Lucide React                                |
| PDF export   | jsPDF                                       |
| File parsing | pdfjs-dist, mammoth (DOCX)                  |
| State / data | localStorage (no Redux / no API)            |

---

## Features

- **AI vs Human scoring** — local heuristic (phrases, sentence length, structure)
- Phrase highlighting in results
- Upload PDF / DOCX / TXT / MD / CSV / JSON / HTML
- Live word / character / sentence counts
- 6 switchable themes (Ocean, Midnight, Sky, Purple, Emerald, Dark Pro)
- Collapsible sidebar + responsive layout
- Dashboard with stats & charts
- Analysis history (search, filter, sort, bulk delete)
- Export reports as PDF / TXT / JSON
- Local accounts (register / login / profile / password)

---

## Project structure

```
src/
├── App.jsx                 # Routes + auth guards
├── auth.js                 # Local register / login / session
├── main.jsx
├── index.css               # Themes + design tokens
├── contexts/
│   └── ThemeContext.jsx    # Theme provider
├── layouts/
│   └── AppLayout.jsx       # Sidebar + top nav
├── pages/
│   ├── Login.jsx / Signup.jsx
│   ├── Dashboard.jsx
│   ├── Analyze.jsx         # Main workspace
│   ├── History.jsx
│   ├── Statistics.jsx
│   ├── Settings.jsx
│   └── Saved.jsx
└── utils/
    ├── storage.js          # localStorage users + analyses
    ├── heuristic.js        # Stylometric scoring engine
    ├── analyzeLocal.js     # Orchestrates analysis + save
    ├── highlight.js        # Phrase highlighting
    ├── report.js           # PDF / TXT / JSON export
    └── readFile.js         # Client-side file text extraction
```

---

## Quick start

```bash
# Install
npm install

# Dev server → http://localhost:5173
npm run dev

# Production build
npm run build
npm run preview
```

That’s all. Create an account on the signup page and start analyzing.

---

## Deploy (static)

Works on any static host:

**Vercel**
```bash
npx vercel
```

**Netlify** — drag the `dist/` folder, or connect the repo.

**GitHub Pages / Cloudflare Pages** — point to the `dist` output after `npm run build`.

`vercel.json` already includes the SPA rewrite so client routes work.

---

## How detection works

1. User pastes text or uploads a document.
2. `heuristic.js` scores AI-like phrases, human markers, sentence length, punctuation, and structure.
3. Result is shown with probability bars, classification, and highlighted phrases.
4. Analysis is saved to `localStorage` for the signed-in user (dashboard / history).

No text ever leaves the browser.

> Scores are probabilistic signals, not definitive proof of authorship.

---

## Themes

Switch anytime from **Settings**:

1. Ocean Blue (default)
2. Midnight Blue
3. Sky Light
4. Purple AI
5. Emerald
6. Dark Pro

Tokens live in `src/index.css` as CSS variables (`--bg-app`, `--color-primary-500`, …).

---

## Notes for frontend developers

- **Auth** is intentionally simple (localStorage). Do not use this pattern for real production apps that need security.
- **No axios / fetch to a backend** — all data flows through `src/utils/storage.js`.
- Charts and layout are responsive; test at mobile widths.
- File parsing (PDF/DOCX) runs fully client-side via `pdfjs-dist` and `mammoth`.

---

## License

MIT — use and extend freely for portfolios and demos.

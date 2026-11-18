# Vastrika

Fashion designer portfolio built with React + Vite.

**Live site:** https://vastrikabangalore.github.io/vastrika/

## Development

```bash
npm install
npm run dev      # start local dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Editing content

- Collections and services: `src/data.js`
- Sections: `src/components/`
- Styles: `src/index.css`

## Deployment

Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
In repo **Settings → Pages**, set **Source** to **GitHub Actions** (one-time).

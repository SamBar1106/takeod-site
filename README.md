# takeod-site

Daykodee / TakeOD site. Content and media come from `daykodee-home` commit `4099e10`. The front end is React, Vite, and React Router.

Shop data is a local placeholder catalog. Set `VITE_API_BASE_URL` later to point at a Wix proxy. This repo does not call Wix and does not contain keys.

## Develop

```bash
npm install
npm run dev
```

The dev server uses the GitHub Pages base path `/takeod-site/`.

```bash
npm run build
npm run preview
```

Pushes to `main` build and deploy to GitHub Pages: https://sambar1106.github.io/takeod-site/

The production build copies `index.html` to `dist/404.html` so GitHub Pages can serve the router on direct links.

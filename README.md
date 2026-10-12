# takeod-site

Project scaffold for the TakeOD (Daykodee) website rebuild. Started from commit 16d5de6 of `SamBar1106/daykodee-home` (the first pre-Wix version).

## Plan
- Front-end swap: the Daykodee/TakeOD Wix site gets rebuilt in React, keeping Web Dev's existing designs, animations and layout.
- Wix stays the backend. The client keeps uploading products in their Wix account, and checkout stays in Wix.
- Later: a small Wix proxy service on the Sam ERP server, exposed via Tailscale Funnel, holds the Wix key. The key never goes in this repo.
- No new pages or effects until Samuel approves.

## Develop
    npm install
    npm run dev

Pushes to `main` build and deploy to GitHub Pages: https://sambar1106.github.io/takeod-site/

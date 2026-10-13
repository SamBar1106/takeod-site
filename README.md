# takeod-site

Daykodee / TakeOD site. Content and media come from `daykodee-home` commit `4099e10`. The front end is React, Vite, and React Router.

The shop, cart, and checkout run in the browser with the Wix Headless JavaScript SDK (`@wix/sdk`, `@wix/stores`, `@wix/ecom`, `@wix/redirects`). Sign-in for a visitor uses `OAuthStrategy` and visitor tokens kept in `localStorage` under `wixSession`. The only credential is the public client ID in `VITE_WIX_CLIENT_ID`. This repo has no API key and no server.

When `VITE_WIX_CLIENT_ID` is empty, the site stays in demo mode: it reads the placeholder catalog in `src/data/products.json`, keeps a local cart, and shows a Demo mode banner. It does not call Wix.

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

## Wix Headless OAuth client

Create a public OAuth client in the Wix dashboard. Do not create an API key.

1. Open the site in the [Wix dashboard](https://manage.wix.com/).
2. Go to **Settings → Development & integrations → Headless Settings**.
3. Under Headless clients, click **Create New Client**. Name it, choose the client type, then click **Create & Continue**.
4. Copy the client ID. Do not copy an API key.
5. Open that client's **Settings**. Under **URLs → Allowed redirect domains**, click **Add Redirect Domain** and enter `sambar1106.github.io`, then save. That domain covers the return to `https://sambar1106.github.io/takeod-site/thank-you`.
6. Locally, copy `.env.example` to `.env` and set `VITE_WIX_CLIENT_ID` to that client ID.
7. In the GitHub repository, add a repository variable named `VITE_WIX_CLIENT_ID` with the same client ID. The Pages workflow passes `vars.VITE_WIX_CLIENT_ID` into the production build. An empty variable keeps the deployed site in demo mode.

Checkout creates a checkout from the current cart, then opens the Wix-hosted checkout with `redirects.createRedirectSession`. Both `postFlowUrl` and `thankYouPageUrl` are `https://sambar1106.github.io/takeod-site/thank-you`.

Catalog calls are read-only queries. The site does not create, update, or delete Wix products. Cart and checkout use the visitor's current cart session.

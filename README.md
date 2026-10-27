# হাটGo (HaatGo)

HaatGo is a Bangladesh-first digital haat: a multi-category marketplace with the warmth and color of a neighborhood bazaar.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Run the storefront

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront. The storefront catalog, cart, checkout, and order history still use local demo data and browser storage; the API catalog and Cash on Delivery order endpoints are separate and the storefront has not been switched to them. The API needs a migrated, seeded database, and online payment is not configured. Newsletter forms only validate the email in the browser; they do not save or send subscriptions. Real social profiles and seller registration are not configured.

The API runs on port 4000 when started with `npm run dev` and exposes `GET /api/health`, `GET /api/categories`, `GET /api/products`, and `GET /api/products/:slug`. Set its environment values from `apps/api/.env.example` in `apps/api/.env` before starting it. PostgreSQL is optional for the health endpoint; catalog routes require a migrated database and return HTTP 503 otherwise. The API does not seed catalog data.

## Checks

```bash
npm run lint
npm run type-check
npm run build
```

The root lint and type-check scripts cover both workspaces. `npm run build` builds the storefront, and `npm run build:api` builds the API. Use `npm run build:all` to build both.

## Workspace

- `apps/web` — Next.js App Router storefront
- `apps/api` — Express API foundation, Prisma schema, and health endpoint

Copy `.env.example` to `.env.local` when configuring local environment values.

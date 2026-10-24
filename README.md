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

Open [http://localhost:3000](http://localhost:3000). The current storefront is the Phase 1 layout foundation; product and account flows come in later phases.

## Checks

```bash
npm run lint
npm run type-check
npm run build
```

## Workspace

- `apps/web` — Next.js App Router storefront
- `apps/api` — reserved for the future API service

Copy `.env.example` to `.env.local` when configuring local environment values.

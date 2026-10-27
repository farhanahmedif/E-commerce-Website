# HaatGo API

Express and TypeScript API foundation. It provides a read-only product catalog and a Cash on Delivery order API backed by Prisma/PostgreSQL. Customer authentication and online payment endpoints are not implemented yet.

## Configure

Copy `.env.example` to `.env` in this directory and set a `JWT_SECRET` with at least 32 characters. Set `DATABASE_URL` to enable the PostgreSQL connection check. `DIRECT_URL` is optional and is used by Prisma migrations when set. The API defaults to port 4000 and allows the storefront origin at `http://localhost:3000`.

## Run

From the repository root, run `npm run dev:api`. The health endpoint is available at `http://localhost:4000/api/health`. Without `DATABASE_URL`, it returns a degraded status with `database: not_configured`; catalog requests then return HTTP 503.

## Catalog endpoints

All responses use `{ success, data, error, meta }`. Catalog routes are read-only and only return active products.

- `GET /api/categories` returns category names, descriptions, slugs, and active product counts.
- `GET /api/products` returns a paginated product list and pagination metadata. Supported query parameters: `q`, `category`, `brand`, `minPrice`, `maxPrice`, `size`, `color`, `inStock`, `sort`, `page` (1–10,000), and `limit` (1–48). Price filters are integer poisha. `inStock=true` returns stocked products; `inStock=false` returns out-of-stock products. Sorting: `newest`, `price-asc`, `price-desc`, or `popular`.
- `GET /api/products/:slug` returns one active product, its images, variants, and up to 20 newest reviews. Review aggregates cover all reviews.

## Order endpoints

- `POST /api/orders` creates a Cash on Delivery order. The request includes product slugs, optional variant SKUs, quantities, contact/address details, delivery zone, and an optional coupon code. The server loads active products, recalculates prices and discounts, validates stock, and creates the order while decrementing inventory in one database transaction. Client-supplied prices and totals are rejected.
- `GET /api/orders/:orderNumber?phone=01XXXXXXXXX` returns limited tracking details only when the phone matches the order.

Order requests require a migrated and seeded PostgreSQL database. No product seed data is included yet; add actual product/category/variant records before connecting the storefront to these endpoints. Online payments remain unavailable until a gateway is configured.

Invalid query values return HTTP 400, unknown or inactive product slugs return 404, and missing/unavailable database tables return 503. Configure `DATABASE_URL` (and optionally `DIRECT_URL`) in `apps/api/.env`, then run `npm run db:migrate --workspace @haatgo/api` from the repository root before using the endpoints against a new database. The API does not seed catalog data.

## Verify

From the repository root, run:

```bash
npm run lint --workspace @haatgo/api
npm run type-check --workspace @haatgo/api
npm run build --workspace @haatgo/api
```

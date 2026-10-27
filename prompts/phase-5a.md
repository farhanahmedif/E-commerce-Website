Read AGENTS.md first, including its Verification Rules. Phases 1 to 4 are complete
(frontend with mock data). Now do PHASE 5A only: backend foundation and database design.
No seed data, no catalog endpoints, no auth, no orders, no payments in this sub-phase.

## 0. Secrets rule
Never write a real connection string, password or secret into any committed file or any
message. Create apps/api/.env.example with placeholders only. Do NOT run any migration
that needs a database connection. Generate everything so I can run the migration myself later.

## 1. Setup in /apps/api
- Node.js + Express + TypeScript (strict). Dev runner: tsx. Build: tsc.
- Prisma with PostgreSQL. Use the current stable Prisma and follow the official docs for the
  installed version; do not guess APIs or config file formats.
- Support DATABASE_URL (pooled) and optional DIRECT_URL for migrations, as the Neon + Prisma docs describe.
- Add apps/api to the root package.json "workspaces". Package name: @haatgo/api.
- Root scripts: dev:web, dev:api, and dev (runs both, e.g. with concurrently). Keep all
  existing scripts working. Update package-lock only through npm.
- Port 4000. Validate env with Zod at startup, failing fast with a clear message:
  DATABASE_URL, DIRECT_URL (optional), PORT, CORS_ORIGIN, NODE_ENV, JWT_SECRET (placeholder).
- Middleware: helmet, cors restricted to CORS_ORIGIN, JSON body limit, rate limiting,
  request logging, central error handler, 404 handler.
- Response format everywhere: { success, data, error, meta }.
- GET /api/health returns status and a database check. If the database is not configured
  or unreachable, return a clear "degraded" status instead of crashing the server.
- Structure: src/config, src/routes, src/controllers, src/services, src/middleware,
  src/validators, src/lib (Prisma client singleton).
- Scripts in apps/api: dev, build, start, lint, type-check, db:migrate, db:studio.

## 2. Prisma schema (design the full schema now to avoid rework later)
Models: User (role enum ADMIN, MANAGER, CUSTOMER), Category, Brand, Product, ProductImage,
ProductVariant (size, color, sku, stock, optional price override), Review, Address, Order,
OrderItem, Coupon, WishlistItem.
Rules: all money fields Int in poisha. Unique, indexed slugs. Indexes for category, brand,
price, createdAt. Enums for order status and payment status. Product bilingual fields
(nameBn, nameEn, descriptionBn, descriptionEn). Order must snapshot item names and prices.
Validate the schema with `prisma validate` and generate the client (`prisma generate`),
which need no database connection. Do not run migrate.

## 3. Verification
- Follow AGENTS.md Verification Rules (never build while dev runs, delete apps/web/.next
  before any web build, end with the styling check line).
- Run lint and type-check in apps/api. Start the API without a database and confirm
  /api/health responds with a degraded status. Confirm the web app is unchanged and still
  fully styled.

## 4. Finish
Do NOT start Phase 5B. Report: a DONE/PARTIAL/MISSING checklist, the exact commands I must
run to create apps/api/.env and run the first migration, which env values I must fill in,
and the "Styling check: PASS/FAIL" line.
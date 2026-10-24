Read AGENTS.md first. Phases 1 and 2 are complete. Now do PHASE 3 only:
Product listing, filters, and Product details pages. Still mock data only (no backend yet).

## 1. Extend the mock data
- Grow products.ts to 24 products across the 8 categories.
- Add fields: brand, description (real Bangla + English copy), images (3 per product,
  generated placeholder visuals via ProductImage), variants (size and/or color where it makes
  sense), sku, tags, createdAt, reviews (3 to 5 per product with name, rating, date, comment in Bangla).
- Add helper functions in /apps/web/lib/mock/: getProducts(filters), getProductBySlug(slug),
  getRelatedProducts(product), getCategoryBySlug(slug). Keep them async-shaped so they can be
  swapped for real API calls later without changing the pages.

## 2. Routes
- /products : all products
- /category/[slug] : products of one category with a themed header (painted signboard of that "দোকান")
- /products/[slug] : product details
- /search?q= : search results (match Bangla and English names and tags)
Use generateStaticParams, generateMetadata (title, description, Open Graph) and a proper not-found page.

## 3. Listing page
- Filters: category, price range (slider with min/max inputs), brand, rating (4+, 3+),
  size, color, in-stock only, on-sale only.
- Sort: newest, price low to high, price high to low, popularity, top rated.
- Filter and sort state lives in the URL query string (shareable, back button works).
- Desktop: sticky filter sidebar. Mobile: filter button opening a bottom-sheet drawer with
  "Apply" and "Clear all"; show active filters as removable chips.
- Pagination (12 per page) with accessible controls.
- Result count in Bangla, e.g. "২৪টি পণ্য পাওয়া গেছে".
- Empty state with personality (haat theme) and a "clear filters" action.
- Loading skeletons (loading.tsx) that match the card layout, no layout shift.
- Breadcrumbs on every page.

## 4. Product details page
- Image gallery: large image, thumbnails, keyboard-navigable, hover zoom on desktop and
  tap-to-zoom (lightbox) on mobile.
- Title, brand, rating with review count, price tag (old price, discount stamp, savings in ৳).
- Variant selectors (size/color) that update availability and show an out-of-stock state.
- Quantity stepper (respects stock), Add to Cart, Buy Now, Wishlist toggle, all wired to the
  existing Zustand store. Add to Cart should open the cart drawer or show a clear confirmation.
- Delivery info block (Dhaka vs outside Dhaka estimate, Cash on Delivery note, return policy).
- Tabs or accordion: Description, Specifications, Reviews, Delivery and Returns.
- Reviews: rating breakdown bars, list of review "paper notes", plus a review form UI
  (validated with Zod; for now it only updates local state).
- Related products row using ProductCard.
- A sticky bottom "Add to Cart" bar on mobile.
- JSON-LD Product schema (name, image, description, sku, brand, offers in BDT, aggregateRating).

## 5. Cart drawer
If the cart drawer from earlier phases is incomplete, finish it: line items, quantity change,
remove, subtotal, free-delivery progress bar, empty state, link to /cart. Persist cart and
wishlist in localStorage via Zustand persist (handle hydration safely, no mismatch errors).

## 6. Quality requirements
- Mobile-first (320px, 768px, 1280px). Server Components by default; "use client" only where needed.
- Keep the "Digital Haat" concept visible: signboards, stamps, hand-written tags.
- Accessibility: labels for all controls, focus management in drawers/lightbox (Esc closes),
  aria-live for result counts, correct heading order.
- Performance: no heavy libraries, lazy-load below the fold, animations on transform/opacity only.

## 7. Finish
Run lint, type-check and build; fix everything. Do NOT start Phase 4.
Report: files created, routes to test, how to run, and any assumptions.
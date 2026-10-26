Read AGENTS.md first. Phases 1 to 3 are complete. Now do PHASE 4 only: Cart, Wishlist,
Checkout UI, Order success and Order tracking. Still mock data only (no backend yet).
Do NOT rebuild what already exists (cart page, cart store). Audit first, then extend.

## 1. Cart page (/cart)
- Line items with image, name, variant, unit price, quantity stepper (respects stock),
  remove, "move to wishlist".
- Order summary: subtotal, discount, delivery charge, total, all in BDT lakh format.
- Coupon box: apply/remove. Mock coupons: HAAT10 (10% off, max ৳500), FREESHIP (free delivery),
  NEW50 (৳50 off over ৳500). Clear success and error messages in Bangla.
- Free-delivery progress bar (threshold ৳1,500).
- Empty state with haat personality and a link to /products.
- Cart persisted in localStorage via Zustand persist, hydration-safe.

## 2. Wishlist page (/wishlist)
- Grid of ProductCards, remove, "add to cart", empty state.
- Navbar wishlist icon shows a live count.

## 3. Checkout (/checkout), single page with clear sections
Allow guest checkout. Redirect to /cart if the cart is empty.
1. Contact and address: full name, phone (Bangladesh format: 01XXXXXXXXX, also accept +8801...),
   email (optional), division, district, thana/upazila (use a small static mock list of
   divisions and districts with a few thanas each), full address, order note.
2. Delivery method: Inside Dhaka (৳60, 1 to 2 days) or Outside Dhaka (৳120, 3 to 5 days).
   Delivery charge updates the total instantly. FREESHIP coupon or free-delivery threshold
   sets it to ৳0.
3. Payment method (UI only for now): Cash on Delivery, bKash, Nagad, Rocket, Card.
   For bKash/Nagad/Rocket show a short instruction panel (send money, enter transaction ID
   and sender number). Mark online methods as "demo mode" in a visible but tasteful way.
   No real payment calls.
4. Order summary sidebar (sticky on desktop, collapsible on mobile) with items, coupon,
   subtotal, delivery, total, and the "অর্ডার নিশ্চিত করুন" button.
- Validation with Zod, inline Bangla error messages, focus moves to the first invalid field,
  button shows loading state, double submit prevented.
- Server-side-style total calculation: compute the total from product data and coupon rules
  in one shared function (lib/pricing.ts), never from displayed numbers, so it can be
  reused by the backend later.

## 4. Order flow (mock)
- On submit: create an order object (id like HG-2026-000123, items snapshot, address,
  delivery, payment method, totals, status "pending", createdAt), save it to localStorage
  (lib/orders.ts, async-shaped for later API swap), clear the cart, go to /order/success/[id].
- /order/success/[id]: celebration in the haat theme, order summary, delivery estimate,
  payment instructions if relevant, buttons: "Track order", "Continue shopping".
  Handle unknown or missing id with a friendly not-found.
- /track-order: form (order id + phone), shows a status timeline
  (pending, confirmed, shipped, delivered), with demo progression only if the order exists.
- /account/orders (simple): list of orders saved on this device, link to each.

## 5. Quality requirements
- Mobile-first (320px, 768px, 1280px). Server Components by default; "use client" only where needed.
- Keep the "Digital Haat" concept visible: signboards, stamps, hand-written tags.
- Accessibility: labels, aria-describedby for errors, aria-live for totals and coupon messages,
  visible focus, correct heading order.
- Add robots noindex metadata for /checkout, /cart, /order/*, /track-order.
- Performance: no heavy libraries, no layout shift when totals change.

## 6. Finish
Run lint, type-check and build; fix everything. Do NOT start Phase 5.
If `next build` fails with an out-of-memory error, do not change app code to fix it.
Run lint and `npx tsc --noEmit` instead, and report the build error to me.
Report: a DONE/PARTIAL/MISSING checklist, routes to test, and any assumptions.
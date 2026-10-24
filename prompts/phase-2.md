Read AGENTS.md first. Phase 1 is complete. Now do PHASE 2 only: the Home page,
the signature "wow" moment, and the ProductCard component. Use mock data only (no backend yet).

## 1. Mock data
Create /apps/web/lib/mock/ with:
- categories.ts: 8 categories with Bangla + English names (e.g. ফ্যাশন, ইলেকট্রনিক্স, গ্রোসারি,
  ঘর-গৃহস্থালি, বিউটি, বই, খেলনা, হাতের কাজ)
- products.ts: 12 realistic products (id, slug, name in Bangla + English, category, price and
  oldPrice in poisha as integers, rating, reviewCount, stock, badge, image)
- No external image URLs and no broken images. Until real photos exist, generate tasteful
  placeholder visuals (SVG/CSS patterns in the brand colors) via a ProductImage component
  that can later switch to next/image with real files.
Add a formatBDT() helper that outputs the lakh format, e.g. ৳ 1,25,000.

## 2. ProductCard component (the heart of the store)
- Hand-written price tag style, old price struck through, discount stamp badge
- Hover: gentle lift, second view of the image, quick-add button sliding in
- Wishlist heart toggle, rating stars, "low stock" chalk label when stock < 5
- Fully keyboard accessible, works on touch (no hover-only actions)
- Wire quick-add and wishlist to the existing Zustand store (create cart + wishlist
  slices if missing). The cart count in the Navbar must update live.

## 3. Home page sections (in this order)
1. HERO + SIGNATURE WOW MOMENT: a giant hand-painted signboard reading "হাটGo"
   that reveals on load, with product "stalls" (floating cards or illustrations) that
   move with scroll parallax. Add one playful interaction (e.g. cursor-following
   highlight or draggable price tag). Strong CTA: "হাটে ঢুকুন" (Enter the Haat).
   Must stay light: no heavy libraries, no video, lazy-load anything below the fold.
2. TRUST STRIP: free delivery over a threshold, Cash on Delivery, easy returns,
   bKash/Nagad accepted, in stamp-style badges.
3. CATEGORIES as "দোকান" (shops): painted-signboard tiles in a non-boring asymmetric grid.
4. আজকের হাট (Today's Haat) trending ticker: a slow marquee of product names and prices,
   pauses on hover, stops if prefers-reduced-motion is on.
5. FLASH SALE: countdown timer (client component, no hydration mismatch) + horizontal
   scroll row of ProductCards.
6. FEATURED PRODUCTS grid with tabs (নতুন / জনপ্রিয় / অফার).
7. BRAND STORY: short Bangla paragraph about why "হাটGo" exists, with texture and a handwritten feel.
8. CUSTOMER REVIEWS styled as paper notes pinned on a board.
9. NEWSLETTER signup with validation (Zod), friendly success message.
Write real Bangla copy (not lorem ipsum) for every section.

## 4. Quality requirements
- Mobile-first; verify 320px, 768px and 1280px layouts.
- Server Components by default; "use client" only where interaction requires it.
- Animations use transform/opacity only; honor prefers-reduced-motion.
- Semantic HTML, one h1, correct heading order, alt text, visible focus states.
- Add page metadata (title, description, Open Graph) for the home page.
- No layout shift: reserve space for images and the countdown.

## 5. Finish
Run lint, type-check and build; fix everything. Do NOT start Phase 3.
Report: files created, how to run, what to test, and any assumptions.
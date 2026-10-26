# PROJECT: হাটGo (HaatGo)

## Identity
HaatGo is a Bangladesh-first, multi-category e-commerce marketplace. The name comes from
"haat", the traditional village market. The site must feel like a vibrant digital haat,
NOT like a generic Shopify template.

## Creative Concept: "The Digital Haat"
- Visual language inspired by Bangladeshi haat-bazaars: hand-painted shop signboards,
  rickshaw and truck-art color energy, jute/paper textures, chalk or hand-written price tags,
  stamp-like badges (e.g. "Fresh", "Sale"), tiny patterns borrowed from nakshi kantha.
- Colors (CSS variables): deep green #0F5132 (dominant), saffron/marigold #F2A900 (accent),
  brick red #C0392B (sale/alerts), warm paper cream #FBF3E4 (background), charcoal #1F1F1F (text).
- Fonts: an expressive display font for headings + "Hind Siliguri" for Bangla/body text.
  Both Bangla and English must look great. No default Inter/Roboto/Arial look.
- Motion: tasteful and meaningful (page reveal, hover on product cards, smooth cart drawer).
  Respect prefers-reduced-motion.
- Forbidden: generic hero + 3 icons layout, purple gradients, lorem ipsum, emoji as icons,
  cramped spacing, broken placeholder images.

## Tech Stack
- Monorepo: /apps/web (Next.js App Router + TypeScript + Tailwind + Framer Motion + Zustand)
            /apps/api (Node.js + Express + TypeScript + Prisma + PostgreSQL + Zod)
- Auth: JWT in httpOnly cookies, bcrypt, roles (admin / manager / customer)
- Payments: SSLCommerz or AamarPay (bKash, Nagad, Rocket, cards) + Cash on Delivery
- Prices stored as integers (poisha); displayed as BDT, e.g. ৳ 1,25,000

## Engineering Rules
1. Strict TypeScript, no `any`. ESLint + Prettier clean.
2. Mobile-first (start at 320px), fast on slow networks, optimized images via next/image.
3. Reusable components, clean folder structure, meaningful names, no duplicated code.
4. Never trust the client for prices or totals. Validate all input with Zod.
5. Never commit secrets. Provide .env.example.
6. No TODOs or fake code left silently. List anything needing my input (API keys, assets) at the end.
7. Do not modify unrelated files. Do not delete anything without telling me.

## Working Style
- Do ONLY the phase I ask for. Stop when it is done and wait.
- Before coding: write a short plan (files, risks). After coding: run lint, type-check and build, fix errors yourself.
- End every phase with: what was built, how to run it, how to test it, what is next.
- If something is ambiguous, pick the most sensible option, state the assumption, continue.
## Verification Rules (mandatory for every phase)
1. Never run `next build` while `next dev` is running. Stop the dev server first.
2. Run the dev server on port 3000 only. If the port is busy, stop the old process
   instead of switching to another port.
3. Do not change next.config, postcss.config, tailwind config or the CSS imports in
   layout/globals.css unless the task requires it. If you do change them, re-verify styling.
4. Before reporting a phase as done: delete apps/web/.next, run `npm run build`, then
   confirm that a stylesheet exists under apps/web/.next/static/css and is larger than 5 KB.
   Then start the app and confirm the home page HTML links a CSS file that returns HTTP 200.
5. End every report with a line: "Styling check: PASS" or "Styling check: FAIL (reason)".
6. If anything looks unstyled or broken, say so honestly. Never report DONE for work
   you did not verify.
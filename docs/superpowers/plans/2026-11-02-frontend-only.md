# Frontend-only Jotform implementation plan

**Goal:** Convert the salon site to static frontend pages, with Jotform handling all leads.

**Architecture:** Keep the existing Next.js design and local catalog. Export static HTML, replace database reads with catalog arrays, and reuse one Jotform iframe component. The user authorized the whole conversion and a placeholder form URL in one constant.

**Tech stack:** Next.js, React, TypeScript, static export, hosted Jotform.

- [x] Add a shared lead form URL constant and URL builder; test placeholder handling and encoded context before implementation.
- [x] Replace booking, checkout, contact, newsletter, and voucher submission with hosted lead collection. Keep the local product bag as an inquiry selection.
- [x] Render public pages and sitemap from local content, generate all static detail routes, and preserve browser-side search/filtering.
- [x] Remove API routes, accounts, admin, Prisma, authentication, SMTP, payments, and their obsolete tests/scripts/dependencies. Preserve existing unrelated edits and private local environment files.
- [x] Update setup documentation and run unit tests, lint, typecheck, static production build, and browser checks of public routes, requests, search, and mobile navigation.

Verification must show that no database or backend credentials are needed, the placeholder cannot submit leads, and no frontend requests target removed API routes. Actual delivery remains untestable until the owner supplies a live Jotform URL.

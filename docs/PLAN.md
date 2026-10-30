# Luxe Salon — analysis and implementation plan

Reference visited: appointment, pricing, contact, FAQs, testimonials, rewards, shop, blog and lip fillers. Homepage fetch timed out twice; supplied summary used for that page. HTML inspection establishes content order and link structure; it does not verify visual spacing or popup behavior.

Page map: reference home → treatment/condition discovery → treatment details → pricing → external Pabau booking; secondary trust content includes reviews, rewards and FAQs; commerce includes shop, basket, checkout and account. Contact offers two branches and a form. Shared components: grouped header navigation, trust strip, contact block, awards, payment marks, newsletter and multi-column legal footer. Reference offer popups and WhatsApp behavior come from supplied brief rather than live browser verification.

Adaptation: original Luxe Salon branding, ivory/charcoal/gold, editorial serif headings, photographic hero, salon service categories and occasions. All demo ratings, staff and addresses are fictional seed content.

## Architecture and page list

- `app/(public)`: home, services and details, pricing, booking, team/profiles, about, gallery, reviews, rewards, shop/products, cart/checkout, blog/articles, FAQ, contact, vouchers, concerns, legal and HTML sitemap.
- `app/(account)/account`: credentials/Google sign-in, registration and customer history.
- `app/(admin)/admin`: role-gated operations and catalogue management.
- `app/api`: validated booking availability, booking changes, forms, checkout, Stripe webhook, cron and administration.
- `components/ui`, `components/sections`: reusable controls, navigation, cards and booking flow.
- `lib`: catalogue, database, auth, availability, validation and email.
- `prisma`: relational schema, migration and realistic seed.

Database: users/auth sessions; clients; branches/staff/schedules/time off; categories/services/add-ons; bookings/items/payments; products/categories/brands/orders/items; coupons/vouchers/loyalty; reviews/blog/gallery/FAQ; contact/subscribers/settings. Integer minor units for money. Atomic slot reservations prevent overlapping active bookings.

## Phases and verification

1. Scaffold Next.js 15/strict TypeScript, Tailwind, shared brand config, PostgreSQL and design system.
2. Build responsive public pages with filtering, accessible dialogs, search and original imagery.
3. Test availability boundaries, overlap/buffer and cancellation rules before implementing the booking engine. Add secure management token and ICS.
4. Add Auth.js, hashed credentials, account history and role checks.
5. Add admin catalogue/bookings/CRM and CSV export.
6. Add cart, server-priced checkout, test Stripe webhook and configurable email.
7. Add metadata, structured data, sitemap, errors/loading, documentation. Run seed, tests, lint, typecheck and production build; smoke-test routes and booking conflict handling.

The app uses PostgreSQL for local development and deployment. The datasource and initial migration are PostgreSQL-specific; configure pooled and direct Neon URLs for the intended environment. See docs/POSTGRESQL.md for build and migration setup.

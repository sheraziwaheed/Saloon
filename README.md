# Luxe Salon

An original salon website built with Next.js 15 App Router, strict TypeScript, Tailwind, shadcn-style Radix controls, Framer Motion, Prisma, Auth.js, React Hook Form/Zod, Stripe test checkout and Nodemailer. The reference was studied for information architecture and UX only; no reference branding, text, images or code is reused.

## Run locally

Use **Node.js 22.19+** (Node 24 recommended) and npm.

```sh
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open **http://127.0.0.1:3000**. Installation creates a local `.env` from `.env.example` with a random authentication secret if none exists, and initializes the SQLite file for Prisma on Windows. Never commit `.env` or database files. The seed is repeatable and does not create a default administrator password.

The demonstration contains 27 services across 6 categories, 6 staff, 2 branches, 12 products, 6 articles, 10 illustrative reviews, FAQs and two offers. Staff profiles, reviews, business details and product claims are fictional demonstration content. Editorial photographs use replaceable Unsplash URLs.

## Pages and flows

- Public: home, services/details, pricing, booking, team/profiles, about, gallery/lightbox/comparison, reviews, rewards, shop/product details, cart, checkout, journal/articles, FAQs, contact/maps, gift vouchers, concerns/occasions, legal drafts, sitemap and custom 404.
- Booking: branch → services and add-ons → specialist/any → available London date/time → validated client details → review/coupon/voucher → confirmation with private management link, optional Stripe test deposit and ICS download.
- Account: registration, credentials/optional Google sign-in, upcoming/past appointment status, secure management links, order history, loyalty balance, browser-local wishlist and profile.
- Admin: overview/chart, appointment list and day/week calendar, drag appointments to move days, branch/staff filters, status updates, catalogue and content forms, schedules/time off, CRM notes, order fulfillment and CSV export. Services are archived; deletion of records with history is blocked by database relations.

Working schedules, duration, per-service buffers, time off, branch, staff service assignment, holidays and active reservations govern availability. Unique staff/time-block records inside a database transaction prevent double-booking. All services and add-on durations must use 15-minute increments. Minimum booking lead time is one hour; booking horizon is 120 days. Customer changes require at least 24 hours’ notice. All times are interpreted in `Europe/London`, including British Summer Time.

Offer codes: `WELCOME15` for the first booking; `HELLO10` for shop/newsletter. Codes are validated on the server. Gift voucher credit is deducted atomically and returned on eligible cancellation. Voucher codes can be issued by the admin; public gift purchase currently goes through the salon team.

## Administrator access

Create an owner deliberately with the seed script. In PowerShell:

```powershell
$env:SEED_ADMIN_PASSWORD = Read-Host 'Choose a strong demo owner password'
npx prisma db seed
Remove-Item Env:SEED_ADMIN_PASSWORD
```

Sign in at `/account` as `owner@luxesalon.example` using that password, then open `/admin`. Choose a unique password of at least 12 characters. Change the seeded owner email in `prisma/seed.ts` for your business. Other users register and confirm their email before signing in; local confirmation links appear in the development server terminal. Owners assign roles under **Admin → Users** using `OWNER`, `MANAGER`, `STYLIST` or `CLIENT`. A stylist also needs a matching `staffId`. Stylist page/API authorization restricts access to that specialist’s appointments. Managers cannot edit owner settings or roles. Public registration always creates `CLIENT` users. Email ownership must be confirmed before historical guest bookings or orders are attached to an account.

All six demo specialists are assigned every service to keep both branches bookable. Tailor these under **Admin → Assignments** before launch. New staff need entries under Schedules and Assignments. Weekday numbers use Sunday = 0. Schedule times use minutes from midnight; 540 = 09:00, 1140 = 19:00. Calendar time edits and day moves preserve London wall-clock time across daylight-saving changes.

## Configuration

Brand name, colours, contact details, social URLs, timezone and canonical origin: `config/site.ts`. Branch details: database `Branch` records and the initial entries in `lib/catalog.ts`. Replace all demonstration addresses, phone/email/social links, testimonials and legal drafts before launch. `lib/catalog.ts` also holds curated home-page sections and seed content. Most catalogue/content pages read directly from Prisma.

Copy service variables into `.env` as needed:

| Variable                                               | Purpose                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `DATABASE_URL`                                         | Local `file:./dev.db`, or a PostgreSQL URL after provider conversion    |
| `AUTH_SECRET`                                          | Random private session signing secret; required in production           |
| `AUTH_URL`                                             | Auth.js public origin                                                   |
| `NEXT_PUBLIC_SITE_URL`                                 | Canonical public origin and checkout return URLs                        |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                 | Optional Google OAuth credentials; callback `/api/auth/callback/google` |
| `STRIPE_SECRET_KEY`                                    | Stripe **test** restricted/secret key; live keys are rejected           |
| `STRIPE_WEBHOOK_SECRET`                                | Required signed webhook verification secret                             |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Email transport; console fallback in development                        |
| `CRON_SECRET`                                          | Bearer token for the hourly reminder route                              |

Set an actual sending email/domain in `config/site.ts` before enabling SMTP. Without SMTP, development emails (including secure appointment links) appear in the server terminal. Production delivery is not silently simulated. Newsletter/contact data persist locally without email credentials.

### Stripe

Use a separate Stripe sandbox/test environment. Configure webhook delivery to `/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`.

For local testing with Stripe CLI:

```sh
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Set its signing secret in `.env`. Payments are priced from the database, not browser totals. Discounts are checked on the server. Checkout collects UK delivery details. Fulfillment happens only after a signed paid webhook, never from the success page. Webhook processing is idempotent by Stripe session ID. Stock is checked again on payment; a paid order with a stock issue is marked `PAID_REVIEW` for manual resolution. Deposits paid after cancellation are marked `REFUND_REQUIRED`. Refunds are handled through the Stripe Dashboard and salon team; cancellation does not automatically issue a card refund.

Without a test key, checkout shows a clear configuration message. It does not fake a payment. A booking can be confirmed without a deposit; when configured, the optional deposit is £20 or the appointment total, whichever is lower.

### Reminders and holidays

Call `GET /api/cron/reminders` hourly with `Authorization: Bearer <CRON_SECRET>`. It emails appointments in the 23–25-hour window, tracks delivery, and cleans up expired rate-limit records. Configure a scheduler that can send that header. Requests without the configured secret are rejected. Admin Settings accepts the following validated keys:

- `holidays`: comma-separated `YYYY-MM-DD` values.
- `bookingRules`: JSON with `leadMinutes`, `horizonDays`, `cancellationHours`, `depositPence`; defaults are 60, 120, 24, 2000.
- `emailTemplates`: JSON with `confirmationSubject`, `confirmationBody`, `reminderSubject`, `reminderBody`. Body placeholders: `{name}`, `{branch}`, `{date}`, `{link}`, `{hours}`.
- `business`: JSON overrides for `name`, `phone`, `email`, `whatsapp`; used in shared navigation/footer and the email sender. Curated marketing copy and branch records remain independently editable.
- `seoDefaults`: JSON `title`, `description` for default metadata.
- `offers`: JSON `enabled`, `code`, `text` for the header offer; maintain the matching discount under Coupons.

## Validation

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

`npm test` includes real SQLite booking conflict and time-off integration tests. Seed first. Tests create uniquely identified clients and remove their own data. Browser verification uses locally installed Chrome:

```sh
node scripts/browser-check.mjs
```

The browser script defaults to a production server at port 3001 (`npm run start -- --port 3001` after building). For development on port 3000, set `BASE_URL=http://127.0.0.1:3000` in your shell. It exercises search, booking, rescheduling, ICS, cancellation, cart, route status and mobile navigation, writing screenshots to ignored `test-results/`. `scripts/account-check.mjs` verifies registration/email confirmation and role checks; run it against the development server for console email fallback. It creates and deletes its own temporary account. `scripts/performance-check.mjs` runs Lighthouse against the production server and saves the measured report. Browser fixtures use `browser-test@example.com`; cancelled demo appointments can be removed via Prisma Studio.

## Deploy to Vercel with PostgreSQL

SQLite is local development only. Vercel’s ephemeral filesystem is unsuitable for this database.

1. Provision a persistent PostgreSQL database and set `DATABASE_URL` securely in the deployment environment.
2. Change the Prisma datasource provider from `sqlite` to `postgresql`. Keep the SQLite migration history in a separate archived development directory; generate a new PostgreSQL initial migration against a development Postgres database. SQLite SQL migrations cannot be applied to Postgres unchanged.
3. Review and commit the PostgreSQL schema/migration. Apply production migrations with `prisma migrate deploy` in your release process. Seed only the intended catalogue; do not add fictional reviews to a live salon.
4. Configure `AUTH_SECRET`, the public origins, OAuth callback, SMTP, Stripe test keys and its webhook. Set the Vercel install command to `npm ci` and build command to `npm run build`.
5. Verify the full booking/payment/webhook/email flow in preview before promoting. The application intentionally rejects live Stripe keys until you deliberately implement and review a live-mode launch.

There is no automatic external deployment or account provisioning in this local deliverable.

## Files

`app/page.tsx` contains the homepage; `app/(public)`, `app/(account)`, `app/(admin)` contain the other route groups; `app/api` contains validated server endpoints. `components/sections` contains shared layouts and flows, `components/ui` contains reusable controls, `lib` owns database/auth/booking/integrations, `prisma` owns schema/migrations/seed. Reference analysis and phase plan are in `docs/PLAN.md`; verification results are in `docs/VERIFICATION.md`.

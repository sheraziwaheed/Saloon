# Verification record

Local verification, 30 October 2026.

- Next.js production build, strict TypeScript and ESLint checked.
- 11 automated tests cover overlap/buffer rules, closing time, cancellation cutoff, London daylight saving, public Host/origin validation, concurrent SQLite reservations, staff service assignment, time off, cross-branch staff selection, invalid coupons, validated settings, email placeholders and structured-data escaping.
- Chrome checked 24 routes, service search, booking confirmation, rescheduling, ICS download, cancellation, persistent cart and mobile navigation. No page JavaScript errors, visible failed images or horizontal overflow were observed.
- Chrome account checks verified that unconfirmed email cannot sign in, confirmation enables access, clients cannot access admin endpoints, owners can access admin tools and stylists are limited to their schedule.
- Dependency installation audit reported zero known vulnerabilities.
- Screenshots and the measured Lighthouse report are in ignored `test-results/`.
- Lighthouse mobile homepage baseline before the typography enlargement: **Performance 92; Accessibility 100; Best Practices 100; SEO 100**. These are local measurements, not a guarantee for all deployed pages or future network conditions.

External integration limits: no user Stripe sandbox credentials, Google OAuth credentials or SMTP credentials were supplied. Their application paths are implemented and configurable, but live provider flows were not exercised. Local bookings work without payments. Email uses the development console fallback; production delivery needs SMTP. Production hosting requires persistent PostgreSQL, provider-specific migrations and the documented environment configuration. Demo business details, imagery and legal drafts must be replaced for a real salon launch.

Code review led to fixes for verified email ownership before guest history access, stable/persisted deposit checkout sessions, conditional transactional rescheduling, staff-service assignment management and London wall-clock calendar moves.

The homepage lives at `app/page.tsx` to isolate its bundle from interactive catalogue pages in the public route group. This removed the listing/animation chunks from initial homepage loading.

Current typography update: a medium scale with 18px base body text, 16px supporting text and controls, proportionate headings and balanced spacing. This supersedes the earlier enlarged 20–22px scale. Home, account, pricing and booking passed font-size/overflow checks at five widths from 320 to 1920px. The Next.js UI build passed directly; Prisma regeneration was skipped because the running app held its unchanged Windows DLL open. Lighthouse was not rerun for this typography-only update.

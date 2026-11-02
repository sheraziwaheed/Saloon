# Luxe Salon

A frontend-only salon website using Next.js, React and TypeScript. Public content comes from `lib/catalog.ts`; hosted Jotform handles lead collection. There is no application backend, database, login, admin dashboard or payment integration.

## Run locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. No backend credentials are required. Optionally set `NEXT_PUBLIC_SITE_URL` to your public origin for canonical links and the sitemap.

## Connect Jotform

Replace **`JOTFORM_URL` in `config/leads.ts`** with your published form URL, such as `https://form.jotform.com/YOUR_NUMERIC_FORM_ID`, then rebuild. This single URL serves every lead flow. The placeholder displays contact details and never submits to a fictitious form.

The shared iframe uses [Jotform's iframe embed method](https://www.jotform.com/help/148-getting-the-form-iframe-code/), with a link to open the hosted form in a new tab. Validation, submission confirmation, email notifications and storage belong to Jotform. No Jotform API key is needed.

Create one general inquiry form with contact fields and these exact **unique field names** to prefill context from the site:

| Unique field name | Value                                                           |
| ----------------- | --------------------------------------------------------------- |
| `requestType`     | `appointment`, `contact`, `newsletter`, `product`, or `voucher` |
| `service`         | Selected service name                                           |
| `branch`          | Preferred salon name                                            |
| `products`        | Selected product names and quantities                           |
| `amount`          | Selected voucher amount                                         |

Context fields may be hidden or visible. Avoid requiring unrelated fields for every inquiry type. Add explicit optional newsletter consent in Jotform. Configure recipient emails and thank-you messages there and test a real submission before launch. Context expresses customer preferences; the salon confirms availability, prices, appointments and purchases directly.

Appointment links preserve the chosen service and branch. Contact and newsletter requests share the hosted form. Product selections remain in browser storage and become inquiries at `/checkout`; no payment is collected. Voucher requests include the selected amount.

## Static deployment

```sh
npm run build
npm run start -- --port 3001
```

Deploy **`out/`** to any static host. The start command is a local static-file preview. Configure the host to serve directory `index.html` files and `404.html` for unknown routes. Images load directly without an image optimization server. Fonts download during the build.

Accounts, admin tools, API routes, live availability, appointment management, automatic booking confirmation and payment processing have been removed. Old account/admin/API URLs return 404.

## Verification

```sh
npm test
npm run lint
npm run typecheck
npm run build
node scripts/browser-check.mjs
```

The browser check uses installed Chrome and the static preview on port 3001 by default; set `BASE_URL` to override it. It checks public routes, search/filtering, request context, product selection, mobile navigation and absence of API requests. Actual Jotform delivery requires a configured live form and is not simulated.

Business details in `config/site.ts`, team profiles, reviews, prices and imagery remain demo content. Content changes are made in source and require a rebuild.

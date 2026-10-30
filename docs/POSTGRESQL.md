# PostgreSQL and Vercel builds

The Prisma datasource uses `postgresql`, with `DATABASE_URL` for application traffic and `DATABASE_URL_UNPOOLED` as `directUrl` for schema operations. Copy both connection strings from the intended Neon project/branch into the corresponding Vercel environment. For local runtime development, set them in an ignored `.env` file as well.

`postinstall` runs only `prisma generate`. `build` runs `prisma generate && next build`. Neither command creates database files or rewrites environment configuration. `scripts/bootstrap.mjs` is now an informational compatibility helper with no file writes.

The root layout and pages that query Prisma use dynamic rendering. Optional settings are read inside a guarded helper that validates stored data and falls back to defaults when reads or parsing fail. A production build can therefore finish without a database connection. Runtime sign-in, bookings and catalogue pages still need a configured database with the schema applied.

Old SQLite migrations and database files were removed. `prisma/migrations/20261030000000_postgresql_init/migration.sql` is a fresh PostgreSQL migration generated from the schema without accessing a remote database. Review it and run `npx prisma migrate deploy` against a new empty database during deployment. For an existing populated database, baseline its migration history before applying the initial migration. Migration execution is separate from the application build.

`npm test` runs database-free tests, including unavailable/invalid settings and PostgreSQL URL validation. `npm run test:integration` requires a seeded PostgreSQL development/test branch. No remote schema changes or seeding are performed by the build fix.

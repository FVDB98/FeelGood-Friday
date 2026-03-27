# FeelGood Friday

This app now uses:

- Clerk for authentication
- Supabase for the hosted Postgres database
- React + Vite for the frontend

The browser talks directly to Supabase using the signed-in Clerk session token.

## Environment

Copy `.env.example` to `.env.local` and set:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`

Notes:

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` come from your Supabase project settings.
- `DATABASE_URL` is the Postgres connection string from the Supabase `Connect` panel.

## Supabase setup

Before the app can read and write journal data, configure Supabase to trust Clerk tokens.

Follow the official guides:

- Clerk + Supabase integration: https://clerk.com/docs/guides/development/integrations/databases/supabase
- Supabase RLS overview: https://supabase.com/docs/guides/database/postgres/row-level-security

Then apply the schema:

```bash
npm run db:schema
```

That schema lives in [db/schema.sql](/Users/felixvanderborgh/Feel/db/schema.sql) and includes:

- journal tables
- triggers for `updated_at`
- row-level security policies scoped to the Clerk user ID

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

## Notes

- Journal data is stored historically by week.
- The current week is created on demand.
- Older weeks remain available for recap and future streak features.

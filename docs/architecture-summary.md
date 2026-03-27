# Backend architecture summary

## Current architecture

FeelGood Friday uses a simplified backend architecture with no custom application server in the request path.

Core services:

- `Clerk` handles authentication and session management
- `Supabase` provides the hosted Postgres database
- `Supabase Row Level Security (RLS)` enforces per-user data access
- `React + Vite` is the frontend client

The frontend talks directly to Supabase using the signed-in Clerk session token.

## High-level flow

### 1. User authentication

1. A user signs in through Clerk.
2. Clerk creates a session for that user.
3. The frontend retrieves the Clerk session token with `getToken()`.
4. The Supabase client uses that token as the access token for database requests.

### 2. Database authorization

1. Supabase receives the authenticated request.
2. Supabase evaluates the JWT claims from the Clerk token.
3. The schema uses the Clerk user ID from `auth.jwt()->>'sub'`.
4. Row Level Security policies allow access only where the row `clerk_user_id` matches that Clerk user ID.

## Data model

The database uses three tables:

- `app_users`
- `journal_weeks`
- `journal_entries`

### `app_users`

Stores:

- Clerk user ID
- first name
- last name

### `journal_weeks`

Stores one row per user per week:

- `clerk_user_id`
- `week_start_date`
- `week_end_date`
- `status`

### `journal_entries`

Stores one row per journal item:

- `week_id`
- `clerk_user_id`
- `day_of_week`
- `entry_type`
- `content`
- `entered_at`
- `updated_at`

## Process flows

### Load current week

1. The frontend gets the current Clerk user and token.
2. The app upserts the user into `app_users`.
3. The app ensures a `journal_weeks` row exists for the current week.
4. The app reads all matching `journal_entries` for that week.
5. The UI maps those rows into the day-by-day journal view.

### Create a journal entry

1. The user writes a gratitude or win entry.
2. The frontend ensures the current week row exists.
3. The frontend inserts a new row into `journal_entries`.
4. Supabase RLS checks that the row belongs to the authenticated Clerk user.
5. The UI updates with the inserted entry.

### Edit a journal entry

1. The user edits an existing entry.
2. The frontend updates the matching `journal_entries` row by `id`.
3. Supabase RLS checks that the entry belongs to the authenticated user.
4. The updated row is returned and reflected in the UI.

### Delete a journal entry

1. The user confirms deletion.
2. The frontend deletes the matching `journal_entries` row by `id`.
3. Supabase RLS checks that the entry belongs to the authenticated user.
4. The UI removes the entry locally after the delete succeeds.

### View recap

1. The frontend loads the current week again.
2. The returned entries are grouped by weekday and type.
3. The recap page renders the weekly summary from those stored rows.

## Why this architecture was chosen

This approach was chosen because it is simpler than maintaining a custom backend API.

Benefits:

- fewer moving parts
- no separate Express server to deploy
- direct use of Supabase as managed Postgres
- Clerk remains the single auth provider
- RLS keeps data access scoped per user
- historical data remains available for recap and streak features

## Security model

- Authentication is owned by Clerk.
- Database access is controlled by Supabase RLS.
- Access control is based on the Clerk user ID in the JWT `sub` claim.
- The schema uses `requesting_clerk_user_id()` to read that claim safely as text.

## Important implementation files

- [db/schema.sql](/Users/felixvanderborgh/Feel/db/schema.sql)
- [src/lib/supabase.js](/Users/felixvanderborgh/Feel/src/lib/supabase.js)
- [src/lib/api.js](/Users/felixvanderborgh/Feel/src/lib/api.js)
- [src/App.jsx](/Users/felixvanderborgh/Feel/src/App.jsx)
- [scripts/apply-schema.js](/Users/felixvanderborgh/Feel/scripts/apply-schema.js)

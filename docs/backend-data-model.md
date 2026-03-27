# Data model

## Model

Do not use one table with these columns:

- `win_entry`
- `win_entry_id`
- `gratitude_entry`
- `gratitude_entry_id`

That shape only supports one win and one gratitude item for a given row. The UI already supports multiple entries per day, so the database should store one row per entry instead.

## Proposed tables

### `app_users`

Stores the Clerk user ID plus an optional local snapshot of the user's first and last name.

### `journal_weeks`

Stores one row per user per week.

Fields:

- `clerk_user_id`
- `week_start_date`
- `week_end_date`
- `status`

### `journal_entries`

Stores one row per journal item.

Fields:

- `id`
- `week_id`
- `clerk_user_id`
- `day_of_week`
- `entry_type`
- `content`
- `entered_at`

This covers the original requirements:

- User ID: `app_users.clerk_user_id`
- User first name: `app_users.first_name`
- User last name: `app_users.last_name`
- Day: `journal_entries.day_of_week`
- Win entry: `journal_entries.content` where `entry_type = 'win'`
- Win entry ID: `journal_entries.id` where `entry_type = 'win'`
- Gratitude entry: `journal_entries.content` where `entry_type = 'gratitude'`
- Gratitude entry ID: `journal_entries.id` where `entry_type = 'gratitude'`
- Date of entry: `journal_entries.entered_at`

## Weekly reset

I would not hard-delete all entries every Monday at `00:00`.

Reasons:

- It destroys user history permanently.
- It makes debugging and support harder.
- It creates avoidable race conditions around midnight.
- The app can simply start a new `journal_weeks` row for the new week.

## Better approach

Use `week_start_date` to scope the current week and keep prior weeks as history.

On Monday:

1. The first write for that user creates a new `journal_weeks` row for the new week.
2. The UI reads only the active week by current `week_start_date`.
3. Older weeks remain available for recap/history if needed.

## If you truly want a weekly clear

Prefer closing the old week instead of deleting it:

```sql
update journal_weeks
set status = 'closed'
where status = 'active'
  and week_start_date < current_date - extract(isodow from current_date)::int + 1;
```

If product requirements later demand deletion, do it as a retention policy after archiving, not as the primary weekly transition.

## Current architecture

- Clerk handles sign-in
- Supabase stores the journal data
- Supabase Row Level Security protects each user's rows
- The frontend talks directly to Supabase with the Clerk session token

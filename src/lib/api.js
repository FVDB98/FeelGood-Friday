import { createClerkSupabaseClient } from './supabase.js'

function toCamelEntry(entry) {
  return {
    id: entry.id,
    dayOfWeek: entry.day_of_week,
    entryType: entry.entry_type,
    content: entry.content,
    enteredAt: entry.entered_at,
    updatedAt: entry.updated_at,
  }
}

async function createAuthedClient(getToken) {
  return createClerkSupabaseClient(async () => {
    const token = await getToken()

    if (!token) {
      throw new Error('Unable to authenticate your session.')
    }

    return token
  })
}

function getWeekStartDate(referenceDate = new Date()) {
  const date = new Date(referenceDate)
  const day = date.getDay()
  const distanceToMonday = day === 0 ? -6 : 1 - day

  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + distanceToMonday)

  return date.toISOString().slice(0, 10)
}

async function ensureWeek(supabase, userId, weekStartDate) {
  const { data, error } = await supabase
    .from('journal_weeks')
    .upsert(
      {
        clerk_user_id: userId,
        week_start_date: weekStartDate,
      },
      {
        onConflict: 'clerk_user_id,week_start_date',
      },
    )
    .select('id, clerk_user_id, week_start_date, week_end_date, status')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function syncCurrentUser(getToken, user) {
  if (!user?.id) {
    throw new Error('Missing Clerk user.')
  }

  const supabase = await createAuthedClient(getToken)
  const { data, error } = await supabase
    .from('app_users')
    .upsert(
      {
        clerk_user_id: user.id,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
      },
      { onConflict: 'clerk_user_id' },
    )
    .select('clerk_user_id, first_name, last_name')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    user: {
      userId: data.clerk_user_id,
      firstName: data.first_name,
      lastName: data.last_name,
    },
  }
}

export async function fetchCurrentWeek(getToken, userId, weekStart) {
  const supabase = await createAuthedClient(getToken)
  const weekStartDate = weekStart ?? getWeekStartDate()
  const week = await ensureWeek(supabase, userId, weekStartDate)

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('id, day_of_week, entry_type, content, entered_at, updated_at')
    .eq('week_id', week.id)
    .order('day_of_week', { ascending: true })
    .order('entered_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return {
    week: {
      id: week.id,
      userId: week.clerk_user_id,
      weekStartDate: week.week_start_date,
      weekEndDate: week.week_end_date,
      status: week.status,
      entries: (entries ?? []).map(toCamelEntry),
    },
  }
}

export async function createEntry(getToken, userId, body) {
  const supabase = await createAuthedClient(getToken)
  const weekStartDate = body.weekStart ?? getWeekStartDate()
  const week = await ensureWeek(supabase, userId, weekStartDate)
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      week_id: week.id,
      clerk_user_id: userId,
      day_of_week: body.day,
      entry_type: body.entryType,
      content: body.content,
    })
    .select('id, day_of_week, entry_type, content, entered_at, updated_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return { entry: toCamelEntry(data) }
}

export async function updateEntry(getToken, entryId, body) {
  const supabase = await createAuthedClient(getToken)
  const { data, error } = await supabase
    .from('journal_entries')
    .update({
      content: body.content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .select('id, day_of_week, entry_type, content, entered_at, updated_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return { entry: toCamelEntry(data) }
}

export async function deleteEntry(getToken, entryId) {
  const supabase = await createAuthedClient(getToken)
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId)

  if (error) {
    throw new Error(error.message)
  }

  return null
}

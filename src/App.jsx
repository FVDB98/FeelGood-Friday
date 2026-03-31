import {
  SignIn,
  SignUp,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/react'
import { useEffect, useState } from 'react'
import './App.css'
import {
  createEntry,
  deleteEntry,
  fetchCurrentWeek,
  syncCurrentUser,
  updateEntry,
} from './lib/api.js'

const highlights = [
  {
    title: 'Daily gratitude',
    description:
      'Capture the small moments that helped you through the day, even when the week felt full.',
  },
  {
    title: 'Tiny wins count',
    description:
      'Log progress without pressure. Completing a difficult task, finishing a workout, or simply getting through counts.',
  },
  {
    title: 'Friday recap',
    description:
      'Head into the weekend with a clear reminder of what went well and what you should feel proud of. No matter how big or small.',
  },
]

const journalEntries = [
  {
    day: 'Monday',
    gratitude: ['Grateful for a sunny morning and a clear head.'],
    wins: ['Met up with a friend.'],
  },
  {
    day: 'Tuesday',
    gratitude: [
      'Making a nice healthy dinner.',
      'Speaking with mum on the phone.',
    ],
    wins: ['Finished a workout.'],
  },
  {
    day: 'Wednesday',
    gratitude: ['Grateful for the good weather.'],
    wins: ['Had a walk and enjoyed the sunshine.'],
  },
  {
    day: 'Thursday',
    gratitude: ['Warm tea watching the rain.'],
    wins: ['Cleaned the house and felt accomplished.'],
  },
  {
    day: 'Friday',
    gratitude: ['Grateful for a fun weekend ahead.'],
    wins: ['Made it through the week!'],
  }
]

const quickStats = [
  { value: '2', suffix: 'mins / day' },
  { value: '5', suffix: 'times / week' },
  { value: 'Unlimited', suffix: 'positives' },
]

const weekdayDefinitions = [
  { key: 'mon', short: 'Mon', long: 'Monday' },
  { key: 'tue', short: 'Tue', long: 'Tuesday' },
  { key: 'wed', short: 'Wed', long: 'Wednesday' },
  { key: 'thu', short: 'Thu', long: 'Thursday' },
  { key: 'fri', short: 'Fri', long: 'Friday' },
]

const futurePlaceholders = {
  gratitude: [
    'Something small that brightened the day.',
    'A moment you will want to hold onto.',
    'A quiet thing worth feeling grateful for.',
  ],
  wins: [
    'A win, even if it looks tiny on paper.',
    'Something you will feel proud of later.',
    'A bit of progress that deserves noticing.',
  ],
}

const dayNumberByKey = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
}

const dayKeyByNumber = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
}

const navItems = [
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
]

const faqItems = [
  {
    question: 'How often should I use FeelGood Friday?',
    answer:
      'A quick check-in each weekday is enough. The habit works best when it feels lightweight and easy to keep up with.',
  },
  {
    question: 'What should I write down?',
    answer:
      'Anything that felt grounding, encouraging, or quietly good. A kind message, a finished task, a walk outside, or simply getting through the day all count.',
  },
  {
    question: 'Do my wins need to be big?',
    answer:
      'No. The point is to notice progress without turning it into pressure. Tiny wins are often the ones that keep momentum going.',
  },
  {
    question: 'What happens on Friday?',
    answer:
      'Your week comes together into a simple recap so you can head into the weekend with a clearer sense of what went well.',
  },
]

const hasClerkKey = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
const ukTimeZone = 'Europe/London'
const ukDatePartFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: ukTimeZone,
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const ukWeekdayNumberByShortLabel = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0,
}

const clerkAppearance = {
  variables: {
    colorPrimary: '#31bc7e',
    colorText: '#50615a',
    colorTextOnPrimaryBackground: '#ffffff',
    colorBackground: '#ffffff',
    colorInputBackground: '#f4f7f6',
    colorInputText: '#24312c',
    colorNeutral: '#d9efe4',
    borderRadius: '1rem',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    rootBox: 'auth-clerk-root',
    cardBox: 'auth-clerk-card-box',
    card: 'auth-clerk-card',
    header: 'auth-clerk-header',
    headerTitle: 'auth-clerk-hidden',
    headerSubtitle: 'auth-clerk-hidden',
    socialButtonsBlockButton: 'auth-clerk-social-button',
    socialButtonsBlockButtonText: 'auth-clerk-social-button-text',
    dividerLine: 'auth-clerk-divider-line',
    dividerText: 'auth-clerk-divider-text',
    formFieldLabel: 'auth-clerk-field-label',
    formFieldInput: 'auth-clerk-field-input',
    formButtonPrimary: 'auth-clerk-primary-button',
    footerActionLink: 'auth-clerk-footer-link',
    footerActionText: 'auth-clerk-footer-text',
    identityPreviewText: 'auth-clerk-identity-text',
    formResendCodeLink: 'auth-clerk-inline-link',
    formFieldAction: 'auth-clerk-inline-link',
    otpCodeFieldInput: 'auth-clerk-field-input',
    alertText: 'auth-clerk-alert-text',
  },
}

function isModifiedEvent(event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
}

function navigateTo(path) {
  if (window.location.pathname === path) {
    return
  }

  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const handleNavigation = () => {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handleNavigation)

    return () => {
      window.removeEventListener('popstate', handleNavigation)
    }
  }, [])

  return pathname
}

function LinkButton({ href, className, onClick, children, ...rest }) {
  const handleClick = (event) => {
    onClick?.(event)

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      rest.target === '_blank' ||
      isModifiedEvent(event)
    ) {
      return
    }

    const url = new URL(href, window.location.origin)

    if (url.origin !== window.location.origin) {
      return
    }

    event.preventDefault()
    navigateTo(url.pathname)
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB').format(date)
}

function getUkDateParts(referenceDate) {
  const parts = ukDatePartFormatter.formatToParts(referenceDate)
  const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    weekday: ukWeekdayNumberByShortLabel[partMap.weekday],
    year: Number(partMap.year),
    month: Number(partMap.month),
    day: Number(partMap.day),
    hour: Number(partMap.hour),
    minute: Number(partMap.minute),
  }
}

function getUkCalendarDate(referenceDate) {
  const { year, month, day } = getUkDateParts(referenceDate)
  return new Date(Date.UTC(year, month - 1, day))
}

function getIsUkRecapMode(referenceDate) {
  const { weekday, hour } = getUkDateParts(referenceDate)

  if (weekday === 5) {
    return hour >= 16
  }

  return weekday === 6 || weekday === 0
}

function getWorkweek(referenceDate) {
  const calendarDate = getUkCalendarDate(referenceDate)
  const currentDay = calendarDate.getUTCDay()
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(calendarDate)
  monday.setUTCDate(calendarDate.getUTCDate() + distanceToMonday)

  return weekdayDefinitions.map((day, index) => {
    const date = new Date(monday)
    date.setUTCDate(monday.getUTCDate() + index)

    return {
      ...day,
      date,
      dateLabel: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC' }).format(date),
    }
  })
}

function createEmptyJournalEntries() {
  return {
    mon: { gratitude: [], wins: [] },
    tue: { gratitude: [], wins: [] },
    wed: { gratitude: [], wins: [] },
    thu: { gratitude: [], wins: [] },
    fri: { gratitude: [], wins: [] },
    weekend: { gratitude: [], wins: [] },
  }
}

function mapWeekToJournalEntries(week) {
  const nextEntries = createEmptyJournalEntries()

  for (const entry of week?.entries ?? []) {
    const dayKey = dayKeyByNumber[entry.dayOfWeek]
    const section = entry.entryType === 'win' ? 'wins' : 'gratitude'

    if (!dayKey || !nextEntries[dayKey]) {
      continue
    }

    nextEntries[dayKey][section].push({
      id: entry.id,
      content: entry.content,
      enteredAt: entry.enteredAt,
      updatedAt: entry.updatedAt,
    })
  }

  return nextEntries
}

function getWeekEntries(entriesByDay, section) {
  return weekdayDefinitions.flatMap((day) => entriesByDay[day.key]?.[section] ?? [])
}

function JournalNotes({ items }) {
  return (
    <ul className="journal-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

const landingPreviewWeekendEntries = {
  mon: {
    gratitude: ['A calm start to the week and enough energy to ease in.'],
    wins: ['Showed up even though motivation was low.'],
  },
  tue: {
    gratitude: ['A homemade dinner that felt nourishing and grounding.'],
    wins: ['Finished a workout and kept the routine going.'],
  },
  wed: {
    gratitude: ['Sunshine, fresh air, and a walk that cleared my head.'],
    wins: ['Made steady progress without spiralling into pressure.'],
  },
  thu: {
    gratitude: ['A quiet evening and time to properly reset at home.'],
    wins: ['Got life admin done and created a calmer space.'],
  },
  fri: {
    gratitude: ['Relief that the weekend is here and something to look forward to.'],
    wins: ['Wrapped up the week and gave myself credit for it.'],
  },
}

function LandingJournalPreview() {
  const previewDay = journalEntries[1]

  return (
    <div className="app-preview-frame" aria-label="Journaling app preview">
      <div className="app-preview-screen">
        <div className="app-preview-surface">
          <div className="app-preview-static">
            <div className="journal-day-selector">
              <div className="day-pill-row">
                {weekdayDefinitions.map((day, index) => {
                  const isActive = day.long === previewDay.day

                  return (
                    <div
                      key={day.key}
                      className={`day-pill ${isActive ? 'day-pill-active' : ''}`}
                    >
                      <span>{day.short}</span>
                      <small>{24 + index}</small>
                    </div>
                  )
                })}
              </div>
            </div>

            <section className="journal-overview-card">
              <div className="journal-overview-header">
                <div className="journal-overview-header-copy">
                  <p className="section-kicker">Journal</p>
                  <h2 className="journal-overview-title">{previewDay.day}</h2>
                  <p className="journal-overview-date">Tuesday, March 25</p>
                  <p className="journal-overview-copy">
                    Keep it short. One line is enough to make the day easier to remember.
                  </p>
                </div>
              </div>

              <div className="journal-sections-grid">
                <section className="journal-section-card">
                  <div className="journal-section-header">
                    <div>
                      <p className="journal-section-kicker">Gratitude</p>
                      <h2>What felt good today?</h2>
                    </div>
                    <span className="journal-section-edit-button" aria-hidden="true">
                      Edit
                    </span>
                  </div>

                  <ul className="journal-list">
                    {previewDay.gratitude.map((entry, index) => (
                      <li key={`${entry}-${index}`} className="journal-entry-item">
                        <div className="journal-entry-row">
                          <span className="journal-entry-text">{entry}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="journal-card-actions">
                    <span className="journal-add-inline" aria-hidden="true">
                      +
                    </span>
                  </div>
                </section>

                <section className="journal-section-card">
                  <div className="journal-section-header">
                    <div>
                      <p className="journal-section-kicker">Win</p>
                      <h2>What went well?</h2>
                    </div>
                    <span className="journal-section-edit-button" aria-hidden="true">
                      Edit
                    </span>
                  </div>

                  <ul className="journal-list">
                    {previewDay.wins.map((entry, index) => (
                      <li key={`${entry}-${index}`} className="journal-entry-item">
                        <div className="journal-entry-row">
                          <span className="journal-entry-text">{entry}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="journal-card-actions">
                    <span className="journal-add-inline" aria-hidden="true">
                      +
                    </span>
                  </div>
                </section>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingWeekendPreview() {
  return (
    <div className="app-preview-frame" aria-label="Weekend recap preview">
      <div className="app-preview-screen">
        <div className="app-preview-surface">
          <div className="app-preview-static">
            <div className="journal-overview-shell">
              <section className="journal-day-selector" aria-label="Weekend preview selector">
                <div className="weekend-banner">
                  <p className="weekend-banner-kicker">Weekend mode</p>
                  <h2>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                      <path d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z" />
                    </svg>
                    Enjoy your weekend!
                  </h2>
                  <p>
                    You made it through the week! Whatever you have planned for the weekend, we hope it’s restful, fun, and exactly what you need.
                    Come back on Monday to start your next week of gratitude and wins!
                  </p>
                </div>
              </section>

              <section className="journal-overview-card">
                <div className="journal-overview-header">
                  <div className="journal-overview-header-copy">
                    <p className="section-kicker">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                      >
                        <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5z" />
                        <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5z" />
                        <path d="M10 7a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1" />
                      </svg>
                      Weekly recap
                    </p>
                    <h1 className="journal-overview-title">This week</h1>
                    <p className="journal-overview-date">23/03/2026 - 27/03/2026</p>
                  </div>
                </div>

                <WeekendRecapPlaceholder
                  journalEntries={landingPreviewWeekendEntries}
                  summaryText="You kept finding small bright spots through the week: calmer mornings, nourishing meals, fresh air, and a home that felt more settled. You also kept moving forward by showing up, finishing your workout, making steady progress, sorting life admin, and closing out the week with something to feel proud of."
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeekendRecapPlaceholder({ journalEntries, summaryText }) {
  const gratitudeEntries = getWeekEntries(journalEntries, 'gratitude')
  const winEntries = getWeekEntries(journalEntries, 'wins')
  const totalEntries = gratitudeEntries.length + winEntries.length
  const previewLimit = 3
  const getEntryContent = (entry) => (typeof entry === 'string' ? entry : entry?.content ?? '')

  return (
    <section className="weekend-recap-card" aria-label="Weekly recap placeholder">
      <div className="weekend-recap-header">
        <h2>Your week at a glance</h2>
        <p>
          {summaryText ??
            'This weekend placeholder will become your full recap. For now, it shows the notes you captured during the week.'}
        </p>
      </div>

      <div className="weekend-recap-stats">
        <article className="weekend-recap-stat">
          <span>{totalEntries}</span>
          <p>Total notes this week</p>
        </article>
        <article className="weekend-recap-stat">
          <span>{gratitudeEntries.length}</span>
          <p>Gratitude entries</p>
        </article>
        <article className="weekend-recap-stat">
          <span>{winEntries.length}</span>
          <p>Wins captured</p>
        </article>
      </div>

      <div className="weekend-recap-grid">
        <article className="weekend-recap-panel">
          <p className="journal-section-kicker">Gratitude</p>
          <h3>Moments worth keeping</h3>
          {gratitudeEntries.length > 0 ? (
            <ul className="journal-list">
              {gratitudeEntries.slice(0, previewLimit).map((entry) => (
                <li key={entry.id ?? getEntryContent(entry)} className="journal-entry-item">
                  <span className="journal-entry-text">{getEntryContent(entry)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="journal-empty-copy">No gratitude notes yet for this week.</p>
          )}
        </article>

        <article className="weekend-recap-panel">
          <p className="journal-section-kicker">Wins</p>
          <h3>Progress you made</h3>
          {winEntries.length > 0 ? (
            <ul className="journal-list">
              {winEntries.slice(0, previewLimit).map((entry) => (
                <li key={entry.id ?? getEntryContent(entry)} className="journal-entry-item">
                  <span className="journal-entry-text">{getEntryContent(entry)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="journal-empty-copy">No wins logged yet for this week.</p>
          )}
        </article>
      </div>
    </section>
  )
}

function JournalSection({
  title,
  entries,
  placeholderEntries,
  draftValue,
  isComposerOpen,
  isLocked,
  onDraftChange,
  onToggleComposer,
  onAddEntry,
  onOpenManager,
}) {
  const entriesToRender = placeholderEntries ?? entries
  const hasPlaceholderEntries = Boolean(placeholderEntries)

  return (
    <section className="journal-section-card">
      <div className="journal-section-header">
        <div>
          <p className="journal-section-kicker">{title}</p>
          <h2>{title === 'Gratitude' ? 'What felt good today?' : 'What went well?'}</h2>
        </div>
        <button
          type="button"
          className="journal-section-edit-button"
          onClick={onOpenManager}
          disabled={isLocked}
        >
          Edit
        </button>
      </div>

      {entriesToRender.length > 0 ? (
        <ul className="journal-list">
          {entriesToRender.map((entry, index) => (
            <li key={`${entry}-${index}`} className="journal-entry-item">
              <div className="journal-entry-row">
                <span
                  className={`journal-entry-text${
                    hasPlaceholderEntries ? ' journal-entry-text-placeholder' : ''
                  }`}
                >
                  {entry}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="journal-empty-copy">Nothing here yet. Add one small note.</p>
      )}

      {isComposerOpen && (
        <div className="journal-composer">
          <textarea
            className="journal-composer-input"
            rows="3"
            value={draftValue}
            placeholder={`Add a ${title.toLowerCase()} note...`}
            onChange={(event) => onDraftChange(event.target.value)}
          />
          <div className="journal-composer-actions">
            <button
              type="button"
              className="journal-composer-icon-button"
              aria-label="Close new entry"
              onClick={onToggleComposer}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>
            </button>
            <button
              type="button"
              className="journal-composer-icon-button journal-composer-icon-button-save"
              aria-label="Save new entry"
              onClick={onAddEntry}
              disabled={!draftValue.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="journal-card-actions">
        {!isComposerOpen && !isLocked && (
          <button
            type="button"
            className="journal-add-inline"
            aria-label={`Add ${title.toLowerCase()} entry`}
            onClick={onToggleComposer}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
            </svg>
          </button>
        )}
      </div>

    </section>
  )
}

function ManageEntriesModal({
  title,
  entries,
  editingIndex,
  editingValue,
  onCancel,
  onStartEditing,
  onEditingChange,
  onCancelEditing,
  onSaveEdit,
  onRequestDelete,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <>
      <div className="entry-modal-backdrop" onClick={onCancel} />
      <div className="entry-modal-shell" role="dialog" aria-modal="true" aria-label={`Manage ${title} entries`}>
        <div className="entry-modal-card">
          <p className="journal-section-kicker">{title}</p>
          <h2 className="entry-modal-title">Manage your {title.toLowerCase()} entries</h2>
          <p className="entry-modal-copy">
            Edit or remove entries here without losing your place on the page.
          </p>
          <div className="entry-modal-list">
            {entries.map((entry, index) => (
              <div className="entry-modal-item" key={entry.id ?? `${entry.content}-${index}`}>
                {editingIndex === index ? (
                  <>
                    <textarea
                      className="journal-composer-input entry-modal-input"
                      rows="4"
                      value={editingValue}
                      onChange={(event) => onEditingChange(event.target.value)}
                    />
                    <div className="journal-composer-actions">
                      <button
                        type="button"
                        className="journal-secondary-button"
                        onClick={onCancelEditing}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="primary-button journal-save-button"
                        onClick={() => onSaveEdit(index)}
                        disabled={!editingValue.trim()}
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="entry-modal-row">
                    <span className="journal-entry-text">{entry.content}</span>
                    <div className="journal-entry-icon-actions">
                      <button
                        type="button"
                        className="journal-entry-picker"
                        aria-label="Edit this entry"
                        onClick={() => onStartEditing(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                        >
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="journal-entry-picker journal-entry-picker-danger"
                        aria-label="Remove this entry"
                        onClick={() => onRequestDelete(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                        >
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {editingIndex === null && (
            <div className="journal-composer-actions">
              <button
                type="button"
                className="journal-secondary-button"
                onClick={onCancel}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function DeleteEntryModal({
  title,
  entry,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <>
      <div className="entry-modal-backdrop" onClick={onCancel} />
      <div className="entry-modal-shell" role="dialog" aria-modal="true" aria-label={`Delete ${title} entry`}>
        <div className="entry-modal-card delete-modal-card">
          <p className="journal-section-kicker">Delete {title}</p>
          <h2 className="entry-modal-title">Delete this entry?</h2>
          <p className="entry-modal-copy">
            This will remove the note below from your journal for the day.
          </p>
          <div className="delete-modal-entry">
            {entry.content}
          </div>
          <div className="journal-composer-actions">
            <button
              type="button"
              className="journal-secondary-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="delete-confirm-button"
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function NavMenuContent({ isSignedIn, onNavigate, isMobile = false }) {
  const currentPath = usePathname()

  return (
    <>
      {isSignedIn && (
        <LinkButton
          className={`${
            isMobile ? 'nav-drawer-link' : 'nav-link'
          }${currentPath === '/week' ? ` ${isMobile ? 'nav-drawer-link-active' : 'nav-link-active'}` : ''}`}
          href="/week"
          onClick={onNavigate}
        >
          My week
        </LinkButton>
      )}
      {navItems.map((item) => (
        <LinkButton
          key={item.href}
          className={`${isMobile ? 'nav-drawer-link' : 'nav-link'}${
            currentPath === item.href
              ? ` ${isMobile ? 'nav-drawer-link-active' : 'nav-link-active'}`
              : ''
          }`}
          href={item.href}
          onClick={onNavigate}
        >
          {item.label}
        </LinkButton>
      ))}
    </>
  )
}

function SiteNav() {
  const { isSignedIn } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isNearTop = currentScrollY < 24

      setHasScrolled(currentScrollY > 12)

      if (isMenuOpen) {
        setIsNavVisible(true)
        lastScrollY = currentScrollY
        return
      }

      if (isNearTop) {
        setIsNavVisible(true)
      } else if (currentScrollY > lastScrollY + 8) {
        setIsNavVisible(false)
      } else if (currentScrollY < lastScrollY - 8) {
        setIsNavVisible(true)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMenuOpen])

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <header
        className={`topbar ${isNavVisible ? 'topbar-visible' : 'topbar-hidden'} ${
          hasScrolled ? 'topbar-scrolled' : ''
        }`}
      >
        <LinkButton className="brand" href="/" aria-label="FeelGood Friday home">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2"
            />
          </svg>
          FeelGood Friday
        </LinkButton>

        <nav className="nav-primary" aria-label="Primary navigation">
          <NavMenuContent isSignedIn={isSignedIn} />
        </nav>

        <div className="nav-actions">
          {isSignedIn ? (
            <div className="user-button-shell nav-user-desktop">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <LinkButton className="sign-in-link" href="/signin">
              Login
            </LinkButton>
          )}

          <button
            type="button"
            className="nav-menu-button"
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`nav-drawer-backdrop${isMenuOpen ? ' nav-drawer-backdrop-open' : ''}`}
        onClick={closeMenu}
        aria-hidden={isMenuOpen ? 'false' : 'true'}
      />

      <aside
        id="mobile-navigation"
        className={`nav-drawer${isMenuOpen ? ' nav-drawer-open' : ''}`}
        aria-hidden={isMenuOpen ? 'false' : 'true'}
      >
        <div className="nav-drawer-header">
          <p className="nav-drawer-kicker">Menu</p>
          <button
            type="button"
            className="nav-drawer-close"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
          </button>
        </div>

        <nav className="nav-drawer-links" aria-label="Mobile navigation">
          <NavMenuContent
            isSignedIn={isSignedIn}
            isMobile
            onNavigate={closeMenu}
          />
        </nav>

        <div className="nav-drawer-footer">
          {isSignedIn ? (
            <div className="user-button-shell">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <LinkButton className="nav-drawer-signin" href="/signin" onClick={closeMenu}>
              Login
            </LinkButton>
          )}
        </div>
      </aside>
    </>
  )
}

function AuthWidget({ mode }) {
  if (!hasClerkKey) {
    return (
      <div className="auth-empty-state">
        <p className="auth-empty-title">Clerk is ready to connect</p>
        <p className="auth-empty-copy">
          Add your Clerk publishable key in <code>.env.local</code> to render
          the live auth experience here.
        </p>
        <code className="auth-empty-code">
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
        </code>
      </div>
    )
  }

  if (mode === 'signup') {
    return (
      <SignUp
        appearance={clerkAppearance}
        signInUrl="/signin"
        forceRedirectUrl="/welcome"
      />
    )
  }

  return (
    <SignIn
      appearance={clerkAppearance}
      signUpUrl="/signup"
      forceRedirectUrl="/welcome"
    />
  )
}

function AuthPage({ mode }) {
  const authTitle = mode === 'signup' ? 'Create an account' : 'Log in'

  return (
    <main className="page-shell auth-page-shell">
      <SiteNav />

      <section className="auth-layout auth-layout-minimal">
        <article className="auth-card auth-card-minimal">
          <div className="auth-page-title-banner">
            <LinkButton className="auth-back-link" href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
              Back
            </LinkButton>
            <h1 className="auth-page-title">{authTitle}</h1>
          </div>
          <div className="auth-clerk-shell">
            <AuthWidget mode={mode} />
          </div>
        </article>
      </section>
    </main>
  )
}

function LandingPage() {
  return (
    <main className="page-shell">
      <SiteNav />

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="m7.994.013-.595.79a.747.747 0 0 0 .101 1.01V4H5a2 2 0 0 0-2 2v3H2a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-1V6a2 2 0 0 0-2-2H8.5V1.806A.747.747 0 0 0 8.592.802zM4 6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v.414a.9.9 0 0 1-.646-.268 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0A.9.9 0 0 1 4 6.414zm0 1.414c.49 0 .98-.187 1.354-.56a.914.914 0 0 1 1.292 0c.748.747 1.96.747 2.708 0a.914.914 0 0 1 1.292 0c.374.373.864.56 1.354.56V9H4zM1 11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.793l-.354.354a.914.914 0 0 1-1.293 0 1.914 1.914 0 0 0-2.707 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0L1 11.793zm11.646 1.854a1.915 1.915 0 0 0 2.354.279V15H1v-1.867c.737.452 1.715.36 2.354-.28a.914.914 0 0 1 1.292 0c.748.748 1.96.748 2.708 0a.914.914 0 0 1 1.292 0c.748.748 1.96.748 2.707 0a.914.914 0 0 1 1.293 0Z" />
            </svg>
            Celebrate your week
          </p>
          <h1>
            FeelGood <span className="hero-friday">Friday</span>
          </h1>
          <p className="hero-subtitle">
            Whether you thrived or survived the week - celebrate YOUR wins no
            matter how big or small
          </p>
          <p className="hero-description">
            Every weekday, make a note of what you’re grateful for and the wins you
            made. On Friday, get a feel-good recap of your week. Delivered right
            on time for the weekend.
          </p>
          <div className="hero-actions">
            <LinkButton className="primary-button" href="/signup">
              Create an account
            </LinkButton>
          </div>
        </div>

        <div className="hero-panel" aria-label="App preview">
          <div className="hero-preview-copy panel-card panel-card-main">
            <span className="panel-label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811z" />
                <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492z" />
                <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
              </svg>
              App preview
            </span>
            <h2>A snapshot of the journaling flow</h2>
            <p className="panel-summary">
              See the same weekday journal layout before you sign up: a quick day
              selector, space for gratitude and wins, and a lightweight flow that
              feels easy to return to.
            </p>
          </div>
          <LandingJournalPreview />
        </div>
      </section>

      <section className="hero-section hero-section-secondary">
        <div className="hero-panel hero-panel-reverse" aria-label="Weekend recap preview">
          <LandingWeekendPreview />
          <div className="hero-preview-copy panel-card panel-card-main app-preview-copy-card">
            <span className="panel-label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5z" />
                <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5z" />
                <path d="M10 7a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1" />
              </svg>
              Weekend recap
            </span>
            <h2>A snapshot of your weekly recap</h2>
            <p className="panel-summary">
              By the weekend, your entries turn into a simple recap with a summary,
              totals, and the standout wins and gratitude moments from the week.
            </p>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="FeelGood Friday quick stats">
        <div className="stats-grid">
          {quickStats.map((item) => (
            <article className="stat-card" key={item.suffix}>
              <p className="stat-line">
                <span className="stat-value">{item.value}</span>{' '}
                <span className="stat-suffix">{item.suffix}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section" aria-label="How FeelGood Friday works">
        <div className="section-heading">
          <p className="section-kicker">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M8.05 9.6c.336 0 .504-.24.554-.627.04-.534.198-.815.847-1.26.673-.475 1.049-1.09 1.049-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.7 1.7 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745" />
              <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z" />
              <path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0" />
            </svg>
            How it works
          </p>
          <h2>Simple enough to keep up with, meaningful enough to stick</h2>
        </div>
        <div className="highlight-grid">
          {highlights.map((item) => (
            <article className="highlight-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function WelcomePage() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const firstName = user?.firstName || user?.username || 'there'
  
  return (
    <main className="page-shell">
      <SiteNav />

      <section className="welcome-shell">
        <article className="welcome-card">
          <p className="section-kicker">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5M4.285 9.567a.5.5 0 0 1 .683.183A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8" />
            </svg>
            Welcome
          </p>
          <h1 className="welcome-title">Welcome, {firstName}!</h1>
          <p className="welcome-description">
            Your FeelGood Friday space is ready. Start with one small note of
            gratitude or one win from today, and let the week build from there.
          </p>

          <div className="welcome-grid">
            <div className="welcome-panel">
              <span className="welcome-panel-title">What happens next</span>
              <ul className="journal-list">
                <li>Add a quick gratitude note each weekday</li>
                <li>Log the wins you want to remember</li>
                <li>Come back on Friday for your recap</li>
              </ul>
            </div>
            <div className="welcome-panel welcome-panel-accent">
              <span className="welcome-panel-title">Your first step</span>
              <p>
                Keep it simple. One sentence is enough to start building the
                habit.
              </p>
            </div>
          </div>

          <div className="welcome-actions">
            <LinkButton
              className="primary-button welcome-button"
              href={isSignedIn ? '/week' : '/signin'}
            >
              Get started
            </LinkButton>
          </div>
        </article>
      </section>
    </main>
  )
}

function JournalOverviewPage() {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const ukToday = getUkCalendarDate(currentTime)
  const ukCurrentDay = ukToday.getUTCDay()
  const isRecapMode = getIsUkRecapMode(currentTime)
  const workweek = getWorkweek(currentTime)
  const startOfToday = ukToday
  const todayEntryKey = isRecapMode ? 'weekend' : weekdayDefinitions[ukCurrentDay - 1].key
  const [selectedDayKey, setSelectedDayKey] = useState(todayEntryKey)
  const [journalEntries, setJournalEntries] = useState(() => createEmptyJournalEntries())
  const [isLoadingWeek, setIsLoadingWeek] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [apiError, setApiError] = useState('')
  const [composerState, setComposerState] = useState({
    gratitude: false,
    wins: false,
  })
  const [activeManagerSection, setActiveManagerSection] = useState(null)
  const [draftState, setDraftState] = useState({
    gratitude: '',
    wins: '',
  })
  const [editingState, setEditingState] = useState({
    gratitude: { index: null, value: '' },
    wins: { index: null, value: '' },
  })
  const [pendingDeleteState, setPendingDeleteState] = useState(null)
  const activeDayKey = selectedDayKey === 'weekend' ? 'fri' : selectedDayKey

  const activeDay = workweek.find((day) => day.key === selectedDayKey)
  const isActiveDayToday = !isRecapMode && selectedDayKey === todayEntryKey
  const activeDateLabel = isRecapMode
    ? `${workweek[0]?.dateLabel ?? formatDate(ukToday)} - ${workweek[workweek.length - 1]?.dateLabel ?? formatDate(ukToday)}`
    : activeDay?.dateLabel ?? new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC' }).format(ukToday)
  const activeHeading = isRecapMode
    ? 'This week'
    : isActiveDayToday
      ? 'Today'
      : activeDay?.long
  const activeEntries = journalEntries[activeDayKey] ?? { gratitude: [], wins: [] }
  const activeDayStart = activeDay
    ? new Date(activeDay.date)
    : startOfToday
  const isFutureDay = !isRecapMode && activeDayStart.getTime() > startOfToday.getTime()
  const isLocked = isFutureDay || selectedDayKey === 'weekend'
  const daysUntilActive = isFutureDay
    ? Math.round((activeDayStart.getTime() - startOfToday.getTime()) / 86400000)
    : 0
  const managerTitle = activeManagerSection === 'gratitude' ? 'Gratitude' : 'Win'
  const managerEntries = activeManagerSection ? activeEntries[activeManagerSection] : []
  const managerEditingIndex = activeManagerSection
    ? editingState[activeManagerSection].index
    : null
  const managerEditingValue = activeManagerSection
    ? editingState[activeManagerSection].value
    : ''
  const pendingDeleteEntry = pendingDeleteState
    ? activeEntries[pendingDeleteState.section][pendingDeleteState.index]
    : null

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    setSelectedDayKey(todayEntryKey)
    resetJournalUiState()
  }, [todayEntryKey])

  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      setIsLoadingWeek(false)
      return undefined
    }

    let isCancelled = false

    const loadWeek = async () => {
      try {
        setIsLoadingWeek(true)
        setApiError('')
        await syncCurrentUser(getToken, user)
        const response = await fetchCurrentWeek(getToken, user.id)

        if (!isCancelled) {
          setJournalEntries(mapWeekToJournalEntries(response.week))
        }
      } catch (error) {
        if (!isCancelled) {
          setApiError(error.message)
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingWeek(false)
        }
      }
    }

    void loadWeek()

    return () => {
      isCancelled = true
    }
  }, [getToken, isSignedIn, user])

  const resetJournalUiState = () => {
    setComposerState({
      gratitude: false,
      wins: false,
    })
    setActiveManagerSection(null)
    setPendingDeleteState(null)
    setEditingState({
      gratitude: { index: null, value: '' },
      wins: { index: null, value: '' },
    })
  }

  const handleOpenComposer = (section) => {
    if (isLocked || isMutating) {
      return
    }

    setComposerState((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }

  const handleDraftChange = (section, value) => {
    setDraftState((current) => ({
      ...current,
      [section]: value,
    }))
  }

  const handleAddEntry = async (section) => {
    const nextEntry = draftState[section].trim()
    const dayOfWeek = dayNumberByKey[activeDayKey]

    if (!nextEntry || !dayOfWeek) {
      return
    }

    try {
      setIsMutating(true)
      setApiError('')
      const response = await createEntry(getToken, user.id, {
        day: dayOfWeek,
        entryType: section === 'wins' ? 'win' : 'gratitude',
        content: nextEntry,
      })

      setJournalEntries((current) => ({
        ...current,
        [activeDayKey]: {
          ...current[activeDayKey],
          [section]: [...current[activeDayKey][section], response.entry],
        },
      }))
      setDraftState((current) => ({
        ...current,
        [section]: '',
      }))
      setComposerState((current) => ({
        ...current,
        [section]: false,
      }))
    } catch (error) {
      setApiError(error.message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleOpenManager = (section) => {
    if (isLocked || isMutating) {
      return
    }

    setActiveManagerSection(section)
  }

  const handleCloseManager = () => {
    if (!activeManagerSection) {
      return
    }

    handleCancelEditing(activeManagerSection)
    handleCancelDelete()
    setActiveManagerSection(null)
  }

  const handleStartEditing = (section, index) => {
    setEditingState((current) => ({
      ...current,
      [section]: {
        index,
        value: journalEntries[activeDayKey][section][index].content,
      },
    }))
  }

  const handleEditingChange = (section, value) => {
    setEditingState((current) => ({
      ...current,
      [section]: {
        ...current[section],
        value,
      },
    }))
  }

  const handleCancelEditing = (section) => {
    setEditingState((current) => ({
      ...current,
      [section]: {
        index: null,
        value: '',
      },
    }))
  }

  const handleSaveEdit = async (section, index) => {
    const nextValue = editingState[section].value.trim()
    const entry = journalEntries[activeDayKey][section][index]

    if (!nextValue || !entry?.id) {
      return
    }

    try {
      setIsMutating(true)
      setApiError('')
      const response = await updateEntry(getToken, entry.id, {
        content: nextValue,
      })

      setJournalEntries((current) => ({
        ...current,
        [activeDayKey]: {
          ...current[activeDayKey],
          [section]: current[activeDayKey][section].map((currentEntry, entryIndex) =>
            entryIndex === index ? response.entry : currentEntry,
          ),
        },
      }))
      handleCancelEditing(section)
    } catch (error) {
      setApiError(error.message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleDeleteEntry = async (section, index) => {
    const entry = journalEntries[activeDayKey][section][index]

    if (!entry?.id) {
      return
    }

    try {
      setIsMutating(true)
      setApiError('')
      await deleteEntry(getToken, entry.id)

      setJournalEntries((current) => ({
        ...current,
        [activeDayKey]: {
          ...current[activeDayKey],
          [section]: current[activeDayKey][section].filter(
            (_, entryIndex) => entryIndex !== index,
          ),
        },
      }))

      if (editingState[section].index === index) {
        handleCancelEditing(section)
      }

      handleCancelDelete()
    } catch (error) {
      setApiError(error.message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleRequestDelete = (section, index) => {
    if (isMutating) {
      return
    }

    setPendingDeleteState({ section, index })
  }

  const handleCancelDelete = () => {
    if (isMutating) {
      return
    }

    setPendingDeleteState(null)
  }

  const handleSelectDay = (dayKey) => {
    if (isMutating) {
      return
    }

    resetJournalUiState()
    setSelectedDayKey(dayKey)
  }

  if (!isSignedIn || !user?.id) {
    return (
      <main className="page-shell">
        <SiteNav />
        <section className="info-page-shell">
          <article className="info-page-card">
            <p className="section-kicker">Journal</p>
            <h1 className="info-page-title">Log in to view your journal</h1>
            <p className="info-page-description">
              Your weekly entries are tied to your account, so this page is only available when signed in.
            </p>
          </article>
        </section>
      </main>
    )
  }

  const gratitudeContent = activeEntries.gratitude.map((entry) => entry.content)
  const winsContent = activeEntries.wins.map((entry) => entry.content)

  return (
    <main className="page-shell">
      <SiteNav />

      <div className="journal-overview-shell">
        <section className="journal-day-selector" aria-label="Weekday journal selector">
          {isRecapMode ? (
            <div className="weekend-banner">
              <p className="weekend-banner-kicker">Weekend mode</p>
              <h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                  <path d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z" />
                </svg>
                Enjoy your weekend!
              </h2>
              <p>
                You made it through the week! Whatever you have planned for the weekend, we hope it’s restful, fun, and exactly what you need.
                Come back on Monday to start your next week of gratitude and wins!
                </p>
            </div>
          ) : (
            <div className="day-pill-row">
              {workweek.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  className={`day-pill ${selectedDayKey === day.key ? 'day-pill-active' : ''}`}
                  onClick={() => handleSelectDay(day.key)}
                >
                  <span>{day.short}</span>
                  <small>{day.dateLabel.slice(0, 5)}</small>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="journal-overview-card">
          <div className="journal-overview-header">
            <div className="journal-overview-header-copy">
              <p className="section-kicker">
                {isRecapMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5z" />
                    <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5z" />
                    <path d="M10 7a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm4-3a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811z" />
                    <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492z" />
                    <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
                  </svg>
                )}
                {isRecapMode ? 'Weekly recap' : 'Journal'}
              </p>
              <h1 className="journal-overview-title">{activeHeading}</h1>
              <p className="journal-overview-date">{activeDateLabel}</p>
              {!isRecapMode && (
                <p className="journal-overview-copy">
                  Keep it short. One line is enough to make the day easier to remember.
                </p>
              )}
            </div>
          </div>

          {isLoadingWeek && (
            <div className="journal-status-note">
              <p>Loading this week&apos;s entries...</p>
            </div>
          )}

          {apiError && (
            <div className="journal-status-note journal-status-note-error">
              <p>{apiError}</p>
            </div>
          )}

          {isRecapMode ? (
            <WeekendRecapPlaceholder journalEntries={journalEntries} />
          ) : (
            <div className="journal-sections-grid">
              <JournalSection
                title="Gratitude"
                entries={gratitudeContent}
                placeholderEntries={
                  isFutureDay && gratitudeContent.length === 0
                    ? futurePlaceholders.gratitude
                    : null
                }
                draftValue={draftState.gratitude}
                isComposerOpen={composerState.gratitude}
                isLocked={isLocked}
                onDraftChange={(value) => handleDraftChange('gratitude', value)}
                onToggleComposer={() => handleOpenComposer('gratitude')}
                onAddEntry={() => handleAddEntry('gratitude')}
                onOpenManager={() => handleOpenManager('gratitude')}
              />
              <JournalSection
                title="Win"
                entries={winsContent}
                placeholderEntries={
                  isFutureDay && winsContent.length === 0
                    ? futurePlaceholders.wins
                    : null
                }
                draftValue={draftState.wins}
                isComposerOpen={composerState.wins}
                isLocked={isLocked}
                onDraftChange={(value) => handleDraftChange('wins', value)}
                onToggleComposer={() => handleOpenComposer('wins')}
                onAddEntry={() => handleAddEntry('wins')}
                onOpenManager={() => handleOpenManager('wins')}
              />
            </div>
          )}

          {isFutureDay && (
            <div className="journal-future-note">
              <p className="journal-future-note-kicker">Not yet</p>
              <p>
                Hey, come back here {daysUntilActive === 1 ? 'tomorrow' : `in ${daysUntilActive} days`} to add your wins and gratitudes!
              </p>
            </div>
          )}

        </section>
      </div>

      {activeManagerSection && (
        <ManageEntriesModal
          title={managerTitle}
          entries={managerEntries}
          editingIndex={managerEditingIndex}
          editingValue={managerEditingValue}
          onCancel={handleCloseManager}
          onStartEditing={(index) => handleStartEditing(activeManagerSection, index)}
          onEditingChange={(value) => handleEditingChange(activeManagerSection, value)}
          onCancelEditing={() => handleCancelEditing(activeManagerSection)}
          onSaveEdit={(index) => handleSaveEdit(activeManagerSection, index)}
          onRequestDelete={(index) => handleRequestDelete(activeManagerSection, index)}
        />
      )}

      {pendingDeleteState && pendingDeleteEntry && (
        <DeleteEntryModal
          title={pendingDeleteState.section === 'gratitude' ? 'Gratitude' : 'Win'}
          entry={pendingDeleteEntry}
          onCancel={handleCancelDelete}
          onConfirm={() =>
            handleDeleteEntry(pendingDeleteState.section, pendingDeleteState.index)
          }
        />
      )}
    </main>
  )
}

function InfoPage({ kicker, title, description, afterTitle, children }) {
  return (
    <main className="page-shell">
      <SiteNav />

      <section className="info-page-shell">
        <article className="info-page-card">
          <div className="info-page-kicker">{kicker}</div>
          <h1 className="info-page-title">{title}</h1>
          <p className="info-page-description">{description}</p>
          {afterTitle ? <div className="info-page-after-title">{afterTitle}</div> : null}
          <div className="info-page-content">
            {children}
          </div>
        </article>
      </section>
    </main>
  )
}

function AboutPage() {
  const aboutBoxHeartIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M8 7.982C9.664 6.309 13.825 9.236 8 13 2.175 9.236 6.336 6.31 8 7.982" />
      <path d="M3.75 0a1 1 0 0 0-.8.4L.1 4.2a.5.5 0 0 0-.1.3V15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4.5a.5.5 0 0 0-.1-.3L13.05.4a1 1 0 0 0-.8-.4zm0 1H7.5v3h-6zM8.5 4V1h3.75l2.25 3zM15 5v10H1V5z" />
    </svg>
  )

  return (
    <InfoPage
      kicker={(
        <span className="section-kicker">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
          </svg>
          About
        </span>
      )}
      title={(
        <>
          <span>Celebrate the little things, every week</span>
          <span className="info-page-title-icon" aria-hidden="true">{aboutBoxHeartIcon}</span>
        </>
      )}
      afterTitle={(
        <span className="info-page-mobile-divider-icon" aria-hidden="true">
          {aboutBoxHeartIcon}
        </span>
      )}
      description="FeelGood Friday is built to help you be your number one fan. No comparisons and no pressure, just an easy way to be mindful of the goodness in your week - with a summary delivered to you ready for the weekend!"
    >
      <div className="info-page-grid">
        <article className="info-page-panel">
          <h2>Why it exists</h2>
          <p>
            Weeks go by quickly. Small wins, and nice moments
            can easily be overlooked. FeelGood Friday gives them a
            place to be noticed and appreciated.
          </p>
        </article>
        <article className="info-page-panel">
          <h2>How it feels</h2>
          <p> 
            like your own personal highlight reel. A space to celebrate the good stuff, no matter how small.
          </p>
        </article>
        <article className="info-page-panel">
          <h2>What to expect</h2>
          <p>
            No pressure to perform. No comparisons to make. 
            Just a relaxed space to be kind to yourself and notice the good in your week.
          </p>
        </article>
      </div>
    </InfoPage>
  )
}

function FAQPage() {
  const [openQuestion, setOpenQuestion] = useState(null)

  const handleToggle = (question) => {
    setOpenQuestion((currentQuestion) =>
      currentQuestion === question ? null : question
    )
  }

  return (
    <InfoPage
      kicker={(
        <span className="section-kicker">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M6 6.207v9.043a.75.75 0 0 0 1.5 0V10.5a.5.5 0 0 1 1 0v4.75a.75.75 0 0 0 1.5 0v-8.5a.25.25 0 1 1 .5 0v2.5a.75.75 0 0 0 1.5 0V6.5a3 3 0 0 0-3-3H6.236a1 1 0 0 1-.447-.106l-.33-.165A.83.83 0 0 1 5 2.488V.75a.75.75 0 0 0-1.5 0v2.083c0 .715.404 1.37 1.044 1.689L5.5 5c.32.32.5.754.5 1.207" />
            <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
          </svg>
          FAQ
        </span>
      )}
      title="Questions people usually ask first"
      description="A few quick answers to explain how FeelGood Friday fits into your week."
    >
      <div className="faq-list">
        {faqItems.map((item, index) => {
          const isOpen = openQuestion === item.question
          const answerId = `faq-answer-${index}`

          return (
            <article className="faq-item" key={item.question}>
              <button
                type="button"
                className="faq-trigger"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => handleToggle(item.question)}
              >
                <span className="faq-question">{item.question}</span>
                <span
                  className={`faq-icon${isOpen ? ' faq-icon-open' : ''}`}
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M5 8l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <div
                className={`faq-answer-wrapper${isOpen ? ' faq-answer-wrapper-open' : ''}`}
              >
                <div className="faq-answer-inner">
                  <p className="faq-answer" id={answerId}>
                    {item.answer}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </InfoPage>
  )
}

function AuthStatusToast() {
  const { isLoaded, isSignedIn } = useAuth()
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    const storageKey = 'feel-auth-state'
    const previousState = window.sessionStorage.getItem(storageKey)
    const nextState = isSignedIn ? 'signed-in' : 'signed-out'

    if (previousState === null) {
      window.sessionStorage.setItem(storageKey, nextState)
      return
    }

    if (previousState !== nextState) {
      const nextMessage = isSignedIn ? 'Signed in successfully.' : 'Signed out successfully.'
      window.setTimeout(() => {
        setToastMessage(nextMessage)
      }, 0)
      window.sessionStorage.setItem(storageKey, nextState)
      return
    }

    window.sessionStorage.setItem(storageKey, nextState)
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2800)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [toastMessage])

  if (!toastMessage) {
    return null
  }

  return (
    <div className="auth-toast-shell" role="status" aria-live="polite">
      <div className="auth-toast">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.97 11.03l4.992-6.24a.75.75 0 1 0-1.172-.936L6.316 9.447 4.72 7.85a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06-.03" />
        </svg>
        <p>{toastMessage}</p>
      </div>
    </div>
  )
}

function App() {
  const path = usePathname()

  let page = <LandingPage />

  if (path === '/signup') {
    page = <AuthPage mode="signup" />
  } else if (path === '/signin') {
    page = <AuthPage mode="signin" />
  } else if (path === '/welcome') {
    page = <WelcomePage />
  } else if (path === '/week') {
    page = <JournalOverviewPage />
  } else if (path === '/about') {
    page = <AboutPage />
  } else if (path === '/faq') {
    page = <FAQPage />
  }

  return (
    <>
      {hasClerkKey && <AuthStatusToast />}
      {page}
    </>
  )
}

export default App

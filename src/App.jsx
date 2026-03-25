import {
  SignIn,
  SignUp,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/react'
import { useEffect, useState } from 'react'
import './App.css'

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

const upliftingQuotes = [
  "You got this!",
  "Keep going—you're close.",
  "Better days are coming.",
  "One step at a time.",
  "You’re doing amazing.",
  "Progress, not perfection.",
  "This is your moment.",
  "You’re stronger than you think.",
  "Let’s try again today.",
  "You’re on your way.",
  "Small wins matter.",
  "Trust yourself more.",
  "You can do hard things.",
  "Bright things ahead.",
  "Your effort counts.",
  "Today is a fresh start.",
  "You’re growing every day.",
  "Keep shining.",
  "You’re not alone.",
  "You’re capable and ready.",
  "Take it one breath.",
  "Your future is bright.",
  "Keep choosing you.",
  "You’re making it happen.",
  "Hope looks good on you.",
  "You’re allowed to begin.",
  "It’s okay—keep moving.",
  "You’re building something beautiful.",
  "You’re closer than yesterday.",
  "You’re doing your best.",
  "Good things take time.",
  "You’re full of potential.",
  "You can start now.",
  "You’re brave for trying.",
  "This will pass too.",
  "You’re doing better than you know.",
  "The best is unfolding.",
  "You’re becoming unstoppable.",
  "Let hope lead.",
  "You’re right where you need.",
  "Keep the faith.",
  "You’re meant for more.",
  "You’ve come so far.",
  "Your light is real.",
  "You’re built for this.",
  "You’re allowed to bloom.",
  "It’s going to work out.",
  "You’re not starting over—restarting.",
  "You’re getting stronger.",
  "The next step is enough.",
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

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB').format(date)
}

function getWorkweek(referenceDate) {
  const currentDay = referenceDate.getDay()
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() + distanceToMonday)

  return weekdayDefinitions.map((day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)

    return {
      ...day,
      date,
      dateLabel: formatDate(date),
    }
  })
}

function createInitialJournalEntries(referenceDate) {
  const currentDay = referenceDate.getDay()
  const allEntries = {
    mon: {
      gratitude: ['A steady start and a bit of morning calm.'],
      wins: ['Got back into the rhythm of the week.'],
    },
    tue: {
      gratitude: ['A good meal and a thoughtful check-in from a friend.'],
      wins: ['Finished the task I had been putting off.'],
    },
    wed: {
      gratitude: ['A brighter mood by the middle of the week.'],
      wins: ['Made time for a short walk and reset.'],
    },
    thu: {
      gratitude: ['A calmer evening and a clearer head.'],
      wins: ['Wrapped up a few loose ends before Friday.'],
    },
    fri: {
      gratitude: ['The feeling of making it through the week.'],
      wins: ['Held onto momentum and kept showing up.'],
    },
    weekend: {
      gratitude: ['A slower pace and space to recharge.'],
      wins: ['Protected time for rest without guilt.'],
    },
  }

  if (currentDay === 0 || currentDay === 6) {
    return allEntries
  }

  return weekdayDefinitions.reduce((accumulator, day, index) => {
    const isAvailable = index <= currentDay - 1

    accumulator[day.key] = isAvailable
      ? allEntries[day.key]
      : { gratitude: [], wins: [] }

    return accumulator
  }, { weekend: allEntries.weekend })
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

function PositiveQuoteBanner() {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * upliftingQuotes.length),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setQuoteIndex((currentIndex) => {
        let nextIndex = currentIndex

        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * upliftingQuotes.length)
        }

        return nextIndex
      })
    }, 5500)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  return (
    <section className="quote-banner" aria-label="Positive quote">
      <p className="quote-banner-kicker">A little lift for today</p>
      <p className="quote-banner-text">{upliftingQuotes[quoteIndex]}</p>
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
              <div className="entry-modal-item" key={`${entry}-${index}`}>
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
                    <span className="journal-entry-text">{entry}</span>
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
            {entry}
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
  return (
    <>
      {isSignedIn && (
        <a
          className={isMobile ? 'nav-drawer-link nav-drawer-link-strong' : 'nav-link'}
          href="/week"
          onClick={onNavigate}
        >
          My week
        </a>
      )}
      {navItems.map((item) => (
        <a
          key={item.href}
          className={isMobile ? 'nav-drawer-link' : 'nav-link'}
          href={item.href}
          onClick={onNavigate}
        >
          {item.label}
        </a>
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
        <a className="brand" href="/" aria-label="FeelGood Friday home">
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
        </a>

        <nav className="nav-primary" aria-label="Primary navigation">
          <NavMenuContent isSignedIn={isSignedIn} />
        </nav>

        <div className="nav-actions">
          {isSignedIn ? (
            <div className="user-button-shell nav-user-desktop">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <a className="sign-in-link" href="/signin">
              Login
            </a>
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
            <a className="nav-drawer-signin" href="/signin" onClick={closeMenu}>
              Login
            </a>
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
            <a className="auth-back-link" href="/">
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
            </a>
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
            <a className="primary-button" href="/signup">
              Create an account
            </a>
          </div>
        </div>

        <div className="hero-panel" aria-label="Weekly reflection preview">
          <div className="panel-card panel-card-main">
            <span className="panel-label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
              </svg>
              Friday recap
            </span>
            <h2>You made it through the week!</h2>
            <p className="panel-summary">
              Sunshine, good food, thoughtful catch-ups, and a fun weekend
              ahead. You moved your body, got outside, reset your space, and
              made it through the week. Nice work - you deserve to feel good about that!
            </p>
          </div>
          <div className="panel-grid">
            {journalEntries.map((entry) => (
              <article className="panel-card" key={entry.day}>
                <div className="journal-day-header">
                  <h3 className="day-tag">{entry.day}</h3>
                </div>
                <div className="journal-entry">
                  <span className="entry-label">Gratitude</span>
                  <JournalNotes items={entry.gratitude} />
                </div>
                <div className="journal-entry">
                  <span className="entry-label">Win</span>
                  <JournalNotes items={entry.wins} />
                </div>
              </article>
            ))}
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
            <a
              className="primary-button welcome-button"
              href={isSignedIn ? '/week' : '/signin'}
            >
              Get started
            </a>
          </div>
        </article>
      </section>
    </main>
  )
}

function JournalOverviewPage() {
  const today = new Date()
  const currentDay = today.getDay()
  const isWeekend = currentDay === 0 || currentDay === 6
  const workweek = getWorkweek(today)
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEntryKey = isWeekend ? 'weekend' : weekdayDefinitions[currentDay - 1].key
  const [selectedDayKey, setSelectedDayKey] = useState(todayEntryKey)
  const [journalEntries, setJournalEntries] = useState(() => createInitialJournalEntries(today))
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

  const activeDay = workweek.find((day) => day.key === selectedDayKey)
  const isActiveDayToday = !isWeekend && selectedDayKey === todayEntryKey
  const activeDateLabel = isWeekend
    ? formatDate(today)
    : activeDay?.dateLabel ?? formatDate(today)
  const activeHeading = isWeekend
    ? 'Today'
    : isActiveDayToday
      ? 'Today'
      : activeDay?.long
  const activeEntries = journalEntries[selectedDayKey] ?? { gratitude: [], wins: [] }
  const activeDayStart = activeDay
    ? new Date(activeDay.date.getFullYear(), activeDay.date.getMonth(), activeDay.date.getDate())
    : startOfToday
  const isFutureDay = !isWeekend && activeDayStart.getTime() > startOfToday.getTime()
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
    if (isFutureDay) {
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

  const handleAddEntry = (section) => {
    const nextEntry = draftState[section].trim()

    if (!nextEntry) {
      return
    }

    setJournalEntries((current) => ({
      ...current,
      [selectedDayKey]: {
        ...current[selectedDayKey],
        [section]: [...current[selectedDayKey][section], nextEntry],
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
  }

  const handleOpenManager = (section) => {
    if (isFutureDay) {
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
        value: journalEntries[selectedDayKey][section][index],
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

  const handleSaveEdit = (section, index) => {
    const nextValue = editingState[section].value.trim()

    if (!nextValue) {
      return
    }

    setJournalEntries((current) => ({
      ...current,
      [selectedDayKey]: {
        ...current[selectedDayKey],
        [section]: current[selectedDayKey][section].map((entry, entryIndex) =>
          entryIndex === index ? nextValue : entry,
        ),
      },
    }))
    handleCancelEditing(section)
  }

  const handleDeleteEntry = (section, index) => {
    setJournalEntries((current) => ({
      ...current,
      [selectedDayKey]: {
        ...current[selectedDayKey],
        [section]: current[selectedDayKey][section].filter(
          (_, entryIndex) => entryIndex !== index,
        ),
      },
    }))

    if (editingState[section].index === index) {
      handleCancelEditing(section)
    }

    handleCancelDelete()
  }

  const handleRequestDelete = (section, index) => {
    setPendingDeleteState({ section, index })
  }

  const handleCancelDelete = () => {
    setPendingDeleteState(null)
  }

  const handleSelectDay = (dayKey) => {
    resetJournalUiState()
    setSelectedDayKey(dayKey)
  }

  return (
    <main className="page-shell">
      <SiteNav />

      <div className="journal-overview-shell">
        <PositiveQuoteBanner />

        <section className="journal-day-selector" aria-label="Weekday journal selector">
          {isWeekend ? (
            <div className="weekend-banner">
              <p className="weekend-banner-kicker">Weekend mode</p>
              <h2>Enjoy your weekend!</h2>
              <p>
                You made it through the week. Take the softer pace where you can.
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
            <div>
              <p className="section-kicker">Journal</p>
              <h1 className="journal-overview-title">{activeHeading}</h1>
              <p className="journal-overview-date">{activeDateLabel}</p>
            </div>
            <p className="journal-overview-copy">
              Keep it short. One line is enough to make the day easier to remember.
            </p>
          </div>

          <div className="journal-sections-grid">
            <JournalSection
              title="Gratitude"
              entries={activeEntries.gratitude}
              placeholderEntries={
                isFutureDay && activeEntries.gratitude.length === 0
                  ? futurePlaceholders.gratitude
                  : null
              }
              draftValue={draftState.gratitude}
              isComposerOpen={composerState.gratitude}
              isLocked={isFutureDay}
              onDraftChange={(value) => handleDraftChange('gratitude', value)}
              onToggleComposer={() => handleOpenComposer('gratitude')}
              onAddEntry={() => handleAddEntry('gratitude')}
              onOpenManager={() => handleOpenManager('gratitude')}
            />
            <JournalSection
              title="Win"
              entries={activeEntries.wins}
              placeholderEntries={
                isFutureDay && activeEntries.wins.length === 0
                  ? futurePlaceholders.wins
                  : null
              }
              draftValue={draftState.wins}
              isComposerOpen={composerState.wins}
              isLocked={isFutureDay}
              onDraftChange={(value) => handleDraftChange('wins', value)}
              onToggleComposer={() => handleOpenComposer('wins')}
              onAddEntry={() => handleAddEntry('wins')}
              onOpenManager={() => handleOpenManager('wins')}
            />
          </div>

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

function InfoPage({ kicker, title, description, children }) {
  return (
    <main className="page-shell">
      <SiteNav />

      <section className="info-page-shell">
        <article className="info-page-card">
          <p className="section-kicker">{kicker}</p>
          <h1 className="info-page-title">{title}</h1>
          <p className="info-page-description">{description}</p>
          <div className="info-page-content">
            {children}
          </div>
        </article>
      </section>
    </main>
  )
}

function AboutPage() {
  return (
    <InfoPage
      kicker={(
        <>
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
        </>
      )}
      title="A gentler way to notice what went well"
      description="FeelGood Friday is built to help you catch the moments that are easy to forget by the end of a busy week."
    >
      <div className="info-page-grid">
        <article className="info-page-panel">
          <h2>Why it exists</h2>
          <p>
            Most weeks move fast. Small wins, calming routines, and good moments
            can disappear under everything else. FeelGood Friday gives them a
            place to land.
          </p>
        </article>
        <article className="info-page-panel">
          <h2>How it feels</h2>
          <p>
            The experience is intentionally light. A few short notes during the
            week turn into something warm, clear, and useful by Friday.
          </p>
        </article>
        <article className="info-page-panel">
          <h2>What to expect</h2>
          <p>
            No pressure to perform. No need to write essays. Just enough
            structure to help you notice gratitude, momentum, and progress.
          </p>
        </article>
      </div>
    </InfoPage>
  )
}

function FAQPage() {
  return (
    <InfoPage
      kicker={(
        <>
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
        </>
      )}
      title="Questions people usually ask first"
      description="A few quick answers to explain how FeelGood Friday fits into your week."
    >
      <div className="faq-list">
        {faqItems.map((item) => (
          <article className="faq-item" key={item.question}>
            <h2>{item.question}</h2>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </InfoPage>
  )
}

function App() {
  const path = window.location.pathname

  if (path === '/signup') {
    return <AuthPage mode="signup" />
  }

  if (path === '/signin') {
    return <AuthPage mode="signin" />
  }

  if (path === '/welcome') {
    return <WelcomePage />
  }

  if (path === '/week') {
    return <JournalOverviewPage />
  }

  if (path === '/about') {
    return <AboutPage />
  }

  if (path === '/faq') {
    return <FAQPage />
  }

  return <LandingPage />
}

export default App

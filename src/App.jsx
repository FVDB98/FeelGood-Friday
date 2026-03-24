import {
  SignIn,
  SignUp,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/react'
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

function JournalNotes({ items }) {
  return (
    <ul className="journal-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function SiteNav() {
  const { isSignedIn } = useAuth()

  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="FeelGood Friday home">
        FeelGood Friday
      </a>

      <div className="nav-actions">
        {isSignedIn ? (
          <>
            <a className="nav-link" href="/">
              My week
            </a>
            <div className="user-button-shell">
              <UserButton afterSignOutUrl="/" />
            </div>
          </>
        ) : (
          <a className="sign-in-link" href="/signin">
            Sign in
          </a>
        )}
      </div>
    </header>
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
            <a className="primary-button welcome-button" href={isSignedIn ? '/' : '/signin'}>
              Get started
            </a>
          </div>
        </article>
      </section>
    </main>
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

  return <LandingPage />
}

export default App

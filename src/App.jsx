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

function JournalNotes({ items }) {
  return (
    <ul className="journal-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function App() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="FeelGood Friday home">
          FeelGood Friday
        </a>
        <a className="sign-in-link" href="/signin">
          Sign in
        </a>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Celebrate your week</p>
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
            <span className="panel-label">Friday recap</span>
            <h2>You made it through the week</h2>
            <p className="panel-summary">
              Sunshine, good food, thoughtful catch-ups, and a fun weekend
              ahead. You moved your body, got outside, reset your space, and
              made it through the week.
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

      <section className="info-section" aria-label="How FeelGood Friday works">
        <div className="section-heading">
          <p className="section-kicker">How it works</p>
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

export default App

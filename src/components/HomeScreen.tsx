interface Props {
  onQuick: () => void;
  onTourn: () => void;
}

/** Home screen — two cards: Quick Match and Mini Tournament. */
export function HomeScreen({ onQuick, onTourn }: Props) {
  return (
    <div className="home">
      <div className="home-inner">
        <div className="home-hero">
          <h1>
            10i<span className="ball">●</span>Score
          </h1>
          <p>Score tennis. Run a club tournament. Built for thumbs.</p>
        </div>
        <div className="home-cards">
          <div
            className="home-card"
            onClick={onQuick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onQuick()}
          >
            <div className="ic">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3.5 9.5c4 2 13 2 17 0M3.5 14.5c4-2 13-2 17 0" />
              </svg>
            </div>
            <h3>Quick Match</h3>
            <p>Score a single singles or doubles match with proper tiebreaks.</p>
            <div className="arrow">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          <div
            className="home-card"
            onClick={onTourn}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onTourn()}
          >
            <div className="ic">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4h12v4a6 6 0 0 1-12 0V4z" />
                <path d="M4 6h2M18 6h2M9 14h6M8 20h8M12 14v6" />
              </svg>
            </div>
            <h3>Mini Tournament</h3>
            <p>Add players or teams, play round-robin, see the live leaderboard.</p>
            <div className="arrow">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

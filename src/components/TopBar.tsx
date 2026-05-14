import type { MatchState, Tournament, ViewType } from '../types';

interface Props {
  view: ViewType;
  match: MatchState | null;
  tournament: Tournament | null;
  inTournament: boolean;
  onBack: (() => void) | null;
  onHome: () => void;
}

export function TopBar({
  view,
  match,
  tournament,
  inTournament,
  onBack,
  onHome,
}: Props) {
  const showHome = view !== 'home';
  const court =
    view === 'play' && match
      ? match.court
      : view === 'tourn' && tournament
        ? tournament.court
        : '';
  const meta =
    view === 'play' && match
      ? `${match.doubles ? 'Doubles' : 'Singles'}${match.bestOf > 1 ? ` · Best of ${match.bestOf}` : ' · 1 Set'}${inTournament ? ' · Tournament' : ''}`
      : view === 'tourn' && tournament
        ? `${tournament.doubles ? 'Doubles' : 'Singles'} · Round Robin`
        : '';

  return (
    <div className="topbar">
      <div
        className="brand"
        onClick={showHome ? onHome : undefined}
        style={{ cursor: showHome ? 'pointer' : 'default' }}
      >
        <span className="ball-dot" />
        <span className="brand-title">10i</span>
        <span className="brand-mark">Score</span>
      </div>
      {onBack ? (
        <button className="back-chip" onClick={onBack}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {inTournament ? 'Back to tournament' : 'Exit match'}
        </button>
      ) : (
        meta && (
          <div
            className="matchmeta"
            style={{ textAlign: 'right', lineHeight: 1.3 }}
          >
            {court && (
              <div
                style={{
                  color: 'var(--chalk)',
                  fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic',
                  fontSize: 15,
                  letterSpacing: 0,
                  textTransform: 'none',
                  marginBottom: 2,
                }}
              >
                {court}
              </div>
            )}
            <div>{meta}</div>
          </div>
        )
      )}
    </div>
  );
}

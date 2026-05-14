import type { MatchState } from '../types';

interface Props {
  match: MatchState;
  onContinue: () => void;
  inTournament: boolean;
}

/** Winner banner overlay with scoreline + CTA. */
export function WinnerBanner({ match, onContinue, inTournament }: Props) {
  const winner = match.winner!;
  const team = match.players[winner].names.join(' / ');
  const scoreline = match.sets
    .map((s, i) => {
      const tb = match.setTBs[i];
      if (tb) {
        const losing = Math.min(...tb);
        return `${s[winner]}–${s[1 - winner]}(${losing})`;
      }
      return `${s[winner]}–${s[1 - winner]}`;
    })
    .join('  ');

  return (
    <div className="banner">
      <div className="banner-card">
        <div className="small">Game · Set · Match</div>
        <div className="who serif">{team}</div>
        <div className="small">wins</div>
        <div className="scoreline mono">{scoreline}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn primary" onClick={onContinue}>
            {inTournament ? 'Back to tournament →' : 'Home'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { nameOf } from '../logic/tournament';
import type { Fixture, Participant, Standing, Tournament } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { StandingsTable } from './StandingsTable';

interface Props {
  tournament: Tournament;
  standings: Standing[];
  onPlay: (fixtureId: string) => void;
  onEnd: () => void;
  onHome: () => void;
}

/** Tournament dashboard: fixtures (pending + completed) + live standings. */
export function TournamentView({
  tournament,
  standings,
  onPlay,
  onEnd,
  onHome,
}: Props) {
  const total = tournament.fixtures.length;
  const done = tournament.fixtures.filter((f) => f.result).length;
  const pending = tournament.fixtures.filter((f) => !f.result);
  const completed = tournament.fixtures.filter((f) => f.result);
  const allDone = done === total;

  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="tview">
      <div className="tview-head">
        <div>
          <h2>
            Tournament
            {tournament.court && (
              <span
                style={{
                  fontSize: '0.55em',
                  color: 'var(--chalk-dim)',
                  fontStyle: 'italic',
                  marginLeft: 12,
                }}
              >
                · {tournament.court}
              </span>
            )}
          </h2>
          <div className="tview-meta">
            {tournament.doubles ? 'Doubles' : 'Singles'} ·{' '}
            {tournament.bestOf === 1 ? '1 Set' : `Best of ${tournament.bestOf}`} ·{' '}
            {tournament.participants.length}{' '}
            {tournament.doubles ? 'teams' : 'players'}
          </div>
        </div>
        <div className="tview-meta">
          {done} / {total} matches
        </div>
      </div>

      <div className="tview-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Fixtures</h3>
            <div className="sub">{pending.length} up next</div>
          </div>
          {pending.length > 0 && (
            <div className="fxt-section">
              <div className="fxt-section-title">Up next</div>
              <div className="fixture-list">
                {pending.map((fx) => (
                  <FixtureRow
                    key={fx.id}
                    fixture={fx}
                    participants={tournament.participants}
                    onPlay={onPlay}
                  />
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div className="fxt-section">
              <div className="fxt-section-title">Completed</div>
              <div className="fixture-list">
                {completed.map((fx) => (
                  <FixtureRow
                    key={fx.id}
                    fixture={fx}
                    participants={tournament.participants}
                    onPlay={onPlay}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Standings</h3>
            <div className="sub">live</div>
          </div>
          <StandingsTable standings={standings} full={false} />
        </div>
      </div>

      <div className="tview-actions">
        <button className="btn ghost" onClick={onHome}>
          ← Home
        </button>
        <button className="btn danger" onClick={() => setShowConfirm(true)}>
          {allDone ? 'Show final leaderboard' : 'End tournament'}
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title={allDone ? 'Show the leaderboard?' : 'End tournament early?'}
          body={
            allDone
              ? 'All matches are complete. View the final standings.'
              : `${total - done} match${total - done !== 1 ? 'es are' : ' is'} still unplayed. Standings will be based on the matches played so far.`
          }
          confirmText={allDone ? 'Show leaderboard' : 'End tournament'}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            onEnd();
          }}
        />
      )}
    </div>
  );
}

/* ------------- FixtureRow ------------- */

function FixtureRow({
  fixture,
  participants,
  onPlay,
}: {
  fixture: Fixture;
  participants: Participant[];
  onPlay: (id: string) => void;
}) {
  const p0 = participants.find((p) => p.id === fixture.p0Id)!;
  const p1 = participants.find((p) => p.id === fixture.p1Id)!;
  const done = !!fixture.result;
  const win0 = done && fixture.result!.winner === 0;
  const win1 = done && fixture.result!.winner === 1;

  const scoreLine = done
    ? fixture
        .result!.sets.map((s, i) => {
          const tb = fixture.result!.setTBs[i];
          if (tb) return `${s[0]}–${s[1]}(${Math.min(...tb)})`;
          return `${s[0]}–${s[1]}`;
        })
        .join('  ')
    : null;

  return (
    <div
      className={`fixture ${done ? 'done' : 'pending'}`}
      onClick={!done ? () => onPlay(fixture.id) : undefined}
    >
      <div className="fxt-players">
        <div className={`fxt-name ${win0 ? 'win' : done ? 'lose' : ''}`}>
          {nameOf(p0)}
        </div>
        <div className="fxt-vs">vs</div>
        <div
          className={`fxt-name right ${win1 ? 'win' : done ? 'lose' : ''}`}
        >
          {nameOf(p1)}
        </div>
      </div>
      <div className="fxt-status">
        {done ? (
          <span className="mono">{scoreLine}</span>
        ) : (
          <span className="play-pill">Play ▸</span>
        )}
      </div>
    </div>
  );
}

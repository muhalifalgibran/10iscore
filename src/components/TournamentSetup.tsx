import { useRef, useState } from 'react';
import type { Participant, TournamentSetupConfig } from '../types';

interface Props {
  onStart: (cfg: TournamentSetupConfig) => void;
  onBack: () => void;
}

/** Tournament setup — court, format, length, participants list. */
export function TournamentSetup({ onStart, onBack }: Props) {
  const [doubles, setDoubles] = useState(false);
  const [bestOf, setBestOf] = useState(1);
  const [court, setCourt] = useState('');
  const idRef = useRef(0);

  const makeP = (d: boolean): Participant => ({
    id: `p${++idRef.current}`,
    names: d ? ['', ''] : [''],
  });

  const [participants, setParticipants] = useState<Participant[]>(() => [
    makeP(false),
    makeP(false),
    makeP(false),
    makeP(false),
  ]);

  const setDoublesMode = (d: boolean) => {
    setDoubles(d);
    setParticipants((ps) =>
      ps.map((p) => ({
        ...p,
        names: d ? [p.names[0] || '', p.names[1] || ''] : [p.names[0] || ''],
      }))
    );
  };

  const updateName = (id: string, idx: number, val: string) => {
    setParticipants((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        const names = [...p.names];
        names[idx] = val;
        return { ...p, names };
      })
    );
  };

  const addParticipant = () =>
    setParticipants((ps) => [...ps, makeP(doubles)]);
  const removeParticipant = (id: string) =>
    setParticipants((ps) =>
      ps.length > 3 ? ps.filter((p) => p.id !== id) : ps
    );

  const canStart =
    participants.length >= 3 &&
    participants.every((p) => p.names.every((n) => n.trim().length > 0));
  const numMatches = (participants.length * (participants.length - 1)) / 2;

  const handleStart = () => {
    if (!canStart) return;
    onStart({
      doubles,
      bestOf,
      court: court.trim(),
      participants: participants.map((p) => ({
        id: p.id,
        names: p.names.map((n) => n.trim()),
      })),
    });
  };

  return (
    <div className="tsetup">
      <div className="tsetup-card">
        <div className="tsetup-head">
          <h2>New Tournament</h2>
          <p>Round-robin · everyone plays everyone</p>
        </div>

        <div className="group">
          <label>
            Court / venue{' '}
            <span
              style={{
                textTransform: 'none',
                color: 'var(--muted)',
                letterSpacing: '0.02em',
              }}
            >
              · optional
            </span>
          </label>
          <input
            className="field"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            placeholder="e.g. Sunday Social · Sport Center A"
            maxLength={60}
          />
        </div>

        <div className="group">
          <label>Format</label>
          <div className="seg">
            <button
              className={!doubles ? 'on' : ''}
              onClick={() => setDoublesMode(false)}
            >
              Singles
            </button>
            <button
              className={doubles ? 'on' : ''}
              onClick={() => setDoublesMode(true)}
            >
              Doubles
            </button>
          </div>
        </div>

        <div className="group">
          <label>Match length</label>
          <div className="seg">
            <button className={bestOf === 1 ? 'on' : ''} onClick={() => setBestOf(1)}>
              1 Set
            </button>
            <button className={bestOf === 3 ? 'on' : ''} onClick={() => setBestOf(3)}>
              Best of 3
            </button>
          </div>
        </div>

        <div className="pgroup">
          <div className="pgroup-head">
            <label>{doubles ? 'Teams' : 'Players'}</label>
            <div className="count">
              {participants.length} · {numMatches} match
              {numMatches !== 1 ? 'es' : ''}
            </div>
          </div>
          <div className="participants">
            {participants.map((p, i) => (
              <div key={p.id} className={`prow ${doubles ? 'dbl' : ''}`}>
                <div className="pnum">{i + 1}</div>
                <input
                  className="field"
                  value={p.names[0]}
                  placeholder={
                    doubles ? `Team ${i + 1} · Player 1` : `Player ${i + 1}`
                  }
                  onChange={(e) => updateName(p.id, 0, e.target.value)}
                />
                {doubles && (
                  <input
                    className="field"
                    value={p.names[1]}
                    placeholder={`Team ${i + 1} · Player 2`}
                    onChange={(e) => updateName(p.id, 1, e.target.value)}
                  />
                )}
                <button
                  className="remove"
                  onClick={() => removeParticipant(p.id)}
                  disabled={participants.length <= 3}
                  title={participants.length <= 3 ? 'Need at least 3' : 'Remove'}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button className="add-row" onClick={addParticipant}>
            + Add {doubles ? 'team' : 'player'}
          </button>
        </div>

        <div className="actions">
          <button className="btn ghost" onClick={onBack}>
            ← Back
          </button>
          <button className="btn primary" onClick={handleStart} disabled={!canStart}>
            Start tournament →
          </button>
        </div>
      </div>
    </div>
  );
}

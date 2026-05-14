import { useState } from 'react';
import type { MatchSetupConfig } from '../types';

interface Props {
  onStart: (cfg: MatchSetupConfig) => void;
  onBack: () => void;
}

/** Quick Match setup form — court, format, length, names, first server. */
export function SetupScreen({ onStart, onBack }: Props) {
  const [doubles, setDoubles] = useState(false);
  const [bestOf, setBestOf] = useState(3);
  const [firstServer, setFirstServer] = useState(0);
  const [court, setCourt] = useState('');
  const [t0, setT0] = useState({ a: '', b: '' });
  const [t1, setT1] = useState({ a: '', b: '' });

  const placeholderA0 = doubles ? 'Team A · Player 1' : 'Player A';
  const placeholderA1 = 'Team A · Player 2';
  const placeholderB0 = doubles ? 'Team B · Player 1' : 'Player B';
  const placeholderB1 = 'Team B · Player 2';

  const handleStart = () => {
    const nameOr = (v: string, fallback: string) => v.trim() || fallback;
    const players = doubles
      ? [
          { names: [nameOr(t0.a, 'Player 1'), nameOr(t0.b, 'Player 2')] },
          { names: [nameOr(t1.a, 'Player 3'), nameOr(t1.b, 'Player 4')] },
        ]
      : [
          { names: [nameOr(t0.a, 'Player A')] },
          { names: [nameOr(t1.a, 'Player B')] },
        ];
    onStart({ doubles, bestOf, players, firstServer, court: court.trim() });
  };

  return (
    <div className="setup">
      <div className="setup-card">
        <h1>
          10i<span className="ball">●</span>Score
        </h1>
        <div className="sub">
          Tap a side to score. Built for singles & doubles, with proper tiebreaks.
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
            placeholder="e.g. Wimbledon Club · Court 3"
            maxLength={60}
          />
        </div>

        <div className="group">
          <label>Format</label>
          <div className="seg">
            <button className={!doubles ? 'on' : ''} onClick={() => setDoubles(false)}>
              Singles
            </button>
            <button className={doubles ? 'on' : ''} onClick={() => setDoubles(true)}>
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
            <button className={bestOf === 5 ? 'on' : ''} onClick={() => setBestOf(5)}>
              Best of 5
            </button>
          </div>
        </div>

        <div className="group">
          <label>{doubles ? 'Team A' : 'Player A'}</label>
          <div className={`name-row ${doubles ? 'dbl' : ''}`}>
            <input
              className="field"
              value={t0.a}
              onChange={(e) => setT0({ ...t0, a: e.target.value })}
              placeholder={placeholderA0}
            />
            {doubles && (
              <input
                className="field"
                value={t0.b}
                onChange={(e) => setT0({ ...t0, b: e.target.value })}
                placeholder={placeholderA1}
              />
            )}
          </div>
        </div>

        <div className="vs">vs</div>

        <div className="group">
          <label>{doubles ? 'Team B' : 'Player B'}</label>
          <div className={`name-row ${doubles ? 'dbl' : ''}`}>
            <input
              className="field"
              value={t1.a}
              onChange={(e) => setT1({ ...t1, a: e.target.value })}
              placeholder={placeholderB0}
            />
            {doubles && (
              <input
                className="field"
                value={t1.b}
                onChange={(e) => setT1({ ...t1, b: e.target.value })}
                placeholder={placeholderB1}
              />
            )}
          </div>
        </div>

        <div className="group">
          <label>First serve</label>
          <div className="seg">
            <button
              className={firstServer === 0 ? 'on' : ''}
              onClick={() => setFirstServer(0)}
            >
              {doubles ? 'Team A' : 'Player A'}
            </button>
            <button
              className={firstServer === 1 ? 'on' : ''}
              onClick={() => setFirstServer(1)}
            >
              {doubles ? 'Team B' : 'Player B'}
            </button>
          </div>
        </div>

        <div className="actions">
          <button className="btn ghost" onClick={onBack}>
            ← Back
          </button>
          <button className="btn primary" onClick={handleStart}>
            Start match →
          </button>
        </div>
      </div>
    </div>
  );
}

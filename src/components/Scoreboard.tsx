import type { MouseEvent } from 'react';
import {
  gameState,
  isMatchPoint,
  isSetPoint,
  pointsToDisplay,
} from '../logic/scoring';
import type { MatchState } from '../types';

interface Props {
  match: MatchState;
  onPoint: (team: number, evt: MouseEvent<HTMLDivElement>) => void;
  onUndo: () => void;
  canUndo: boolean;
  onToggleServer: () => void;
  onSwapInnerServer: (team: number) => void;
  onExit: () => void;
  inTournament: boolean;
  flashTeam: number | null;
  bumpTeam: number | null;
}

/** The main scoreboard: 2 tap-zones + status + controls. Mobile = stacked court layout. */
export function Scoreboard({
  match,
  onPoint,
  onUndo,
  canUndo,
  onToggleServer,
  onSwapInnerServer,
  onExit,
  inTournament,
  flashTeam,
  bumpTeam,
}: Props) {
  const setSlots = match.bestOf;
  const [ptA, ptB] = pointsToDisplay(match.curGame, match.inTiebreak);
  const gs = gameState(match.curGame);
  const mp = isMatchPoint(match);
  const sp = !mp && isSetPoint(match);

  const statusLabel =
    match.winner !== null
      ? 'Match complete'
      : match.inTiebreak
        ? 'Tiebreak'
        : mp
          ? 'Match point'
          : sp
            ? 'Set point'
            : gs === 'deuce'
              ? 'Deuce'
              : gs === 'advantage'
                ? 'Advantage'
                : 'Play';

  const statusClass = match.inTiebreak
    ? 'tb'
    : gs === 'deuce' || gs === 'advantage' || mp || sp
      ? 'deuce'
      : '';

  return (
    <div className="board">
      {/* Set columns header (hidden on mobile) */}
      <div className="sets-header">
        <div />
        <div className="sets-cols">
          {Array.from({ length: setSlots }).map((_, i) => (
            <div key={i} className="set-col-h">
              S{i + 1}
            </div>
          ))}
        </div>
        <div className="pt-col-h">Points</div>
      </div>

      <div className="teams">
        {[0, 1].map((team) => (
          <TeamRow
            key={team}
            team={team}
            match={match}
            pointsLabel={team === 0 ? ptA : ptB}
            isFlash={flashTeam === team}
            isBump={bumpTeam === team}
            onPoint={onPoint}
            onSwapInnerServer={onSwapInnerServer}
          />
        ))}
      </div>

      <div className="controls">
        <div className="left">
          <button className="btn ghost" onClick={onUndo} disabled={!canUndo}>
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
              <path d="M9 14L4 9l5-5" />
              <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
            </svg>
            Undo
          </button>
          <button
            className="btn ghost"
            onClick={onToggleServer}
            disabled={match.winner !== null}
          >
            <span className="serve-chip">
              <span className="mini-ball" /> Swap server
            </span>
          </button>
        </div>
        <div className={`status ${statusClass}`}>
          <span className="dot" />
          {statusLabel}
        </div>
        <div className="right">
          <button className="btn ghost" onClick={onExit}>
            {inTournament ? 'Back to tournament' : 'Exit match'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------- TeamRow ------------- */

interface TeamRowProps {
  team: number;
  match: MatchState;
  pointsLabel: string;
  isFlash: boolean;
  isBump: boolean;
  onPoint: (team: number, evt: MouseEvent<HTMLDivElement>) => void;
  onSwapInnerServer: (team: number) => void;
}

function TeamRow({
  team,
  match,
  pointsLabel,
  isFlash,
  isBump,
  onPoint,
  onSwapInnerServer,
}: TeamRowProps) {
  const serving = match.server === team && match.winner === null;
  const setsToWin = Math.ceil(match.bestOf / 2);
  const setsWon = match.sets.filter((s) => s[team] > s[1 - team]).length;
  const isWinner = match.winner === team;
  const isMatchOver = match.winner !== null;

  const cellsCount = match.bestOf;
  const cells = [];
  for (let i = 0; i < cellsCount; i++) {
    if (i < match.sets.length) {
      const s = match.sets[i];
      const tb = match.setTBs[i];
      const won = s[team] > s[1 - team];
      cells.push(
        <div key={i} className={`set-cell ${won ? 'won' : ''}`}>
          {s[team]}
          {tb && s[team] < s[1 - team] && (
            <span className="tb-sup">{tb[team]}</span>
          )}
        </div>
      );
    } else if (i === match.sets.length && !isMatchOver) {
      cells.push(
        <div key={i} className="set-cell current">
          {match.curSet[team]}
        </div>
      );
    } else {
      cells.push(
        <div key={i} className="set-cell">
          —
        </div>
      );
    }
  }

  const players = match.players[team].names;
  const innerIdx = match.serverIdx[team];

  return (
    <div
      className={`team ${serving ? 'serving' : ''} ${isFlash ? 'flash' : ''} ${isWinner ? 'winner' : ''}`}
      onClick={(e) => {
        // If user clicked the ball icon, swap inner server (doubles only)
        if ((e.target as HTMLElement).closest('.serve-slot')) return;
        onPoint(team, e);
      }}
    >
      <div className="player-block">
        <div
          className="serve-slot"
          onClick={(e) => {
            e.stopPropagation();
            if (match.doubles && serving) onSwapInnerServer(team);
          }}
          title={
            match.doubles && serving ? 'Tap to swap server within team' : ''
          }
        >
          {serving && <span className="ball-icon" />}
        </div>
        <div className="names">
          {match.doubles ? (
            <div>
              <div className="name-line">
                <span
                  style={{
                    opacity: serving && innerIdx === 0 ? 1 : 0.85,
                    fontWeight: serving && innerIdx === 0 ? 600 : 500,
                  }}
                >
                  {players[0]}
                </span>
                <span className="sm">/</span>
                <span
                  style={{
                    opacity: serving && innerIdx === 1 ? 1 : 0.85,
                    fontWeight: serving && innerIdx === 1 ? 600 : 500,
                  }}
                >
                  {players[1]}
                </span>
              </div>
              <div className="team-sub">
                {serving
                  ? `Serving · ${players[innerIdx]}`
                  : isWinner
                    ? 'Match winner'
                    : `${setsWon}/${setsToWin} sets`}
              </div>
            </div>
          ) : (
            <div>
              <div className="name-line">{players[0]}</div>
              <div className="team-sub">
                {serving
                  ? 'Serving'
                  : isWinner
                    ? 'Match winner'
                    : `${setsWon}/${setsToWin} sets`}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sets-cells">{cells}</div>

      <div className={`pt-cell ${isBump ? 'bump' : ''}`}>
        <span className={`digits ${pointsLabel === 'Ad' ? 'ad' : ''}`}>
          {pointsLabel}
        </span>
      </div>
    </div>
  );
}

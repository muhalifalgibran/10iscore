import type { MatchSetupConfig, MatchState } from '../types';

const POINT_LABELS = ['0', '15', '30', '40'];

/** Returns the display strings for current points (e.g. ["30", "40"] or ["Ad", "—"]). */
export function pointsToDisplay(
  curGame: [number, number],
  inTiebreak: boolean
): [string, string] {
  if (inTiebreak) return [String(curGame[0]), String(curGame[1])];
  const [a, b] = curGame;
  if (a >= 3 && b >= 3) {
    if (a === b) return ['40', '40']; // deuce
    if (a === b + 1) return ['Ad', '—'];
    if (b === a + 1) return ['—', 'Ad'];
  }
  return [POINT_LABELS[a] ?? '40', POINT_LABELS[b] ?? '40'];
}

export function gameState(
  curGame: [number, number]
): 'deuce' | 'advantage' | 'regular' {
  const [a, b] = curGame;
  if (a >= 3 && b >= 3 && a === b) return 'deuce';
  if (a >= 3 && b >= 3 && Math.abs(a - b) === 1) return 'advantage';
  return 'regular';
}

export function gameWonBy(curGame: [number, number]): number | null {
  const [a, b] = curGame;
  if (a >= 4 && a - b >= 2) return 0;
  if (b >= 4 && b - a >= 2) return 1;
  return null;
}

function tiebreakWonBy(curGame: [number, number]): number | null {
  const [a, b] = curGame;
  if (a >= 7 && a - b >= 2) return 0;
  if (b >= 7 && b - a >= 2) return 1;
  return null;
}

export function setWonBy(
  curSet: [number, number],
  justFinishedTiebreak: boolean
): number | null {
  const [a, b] = curSet;
  if (a >= 6 && a - b >= 2) return 0;
  if (b >= 6 && b - a >= 2) return 1;
  if (justFinishedTiebreak) {
    if (a === 7 && b === 6) return 0;
    if (b === 7 && a === 6) return 1;
  }
  return null;
}

function isSetOrMatchPointInner(state: MatchState): boolean {
  const oneAwayFromGame = (team: number): boolean => {
    if (state.inTiebreak) {
      const me = state.curGame[team] + 1;
      const opp = state.curGame[1 - team];
      return me >= 7 && me - opp >= 2;
    }
    const next = [...state.curGame] as [number, number];
    next[team] += 1;
    return gameWonBy(next) === team;
  };
  return [0, 1].some((t) => oneAwayFromGame(t));
}

export function isMatchPoint(state: MatchState): boolean {
  if (state.winner !== null) return false;
  const setsToWin = Math.ceil(state.bestOf / 2);
  const oneAway = [0, 1].map((t) => {
    const setsWon = state.sets.filter((s) => s[t] > s[1 - t]).length;
    return setsWon === setsToWin - 1;
  });
  if (!oneAway[0] && !oneAway[1]) return false;
  return isSetOrMatchPointInner(state);
}

export function isSetPoint(state: MatchState): boolean {
  if (state.winner !== null) return false;
  return [0, 1].some((team) => {
    const oneAwayFromGame = (t: number): boolean => {
      if (state.inTiebreak) {
        const me = state.curGame[t] + 1;
        const opp = state.curGame[1 - t];
        return me >= 7 && me - opp >= 2;
      }
      const next = [...state.curGame] as [number, number];
      next[t] += 1;
      return gameWonBy(next) === t;
    };
    if (!oneAwayFromGame(team)) return false;
    const newSet = [...state.curSet] as [number, number];
    newSet[team] += 1;
    return setWonBy(newSet, state.inTiebreak) === team;
  });
}

export function freshMatchState(cfg: MatchSetupConfig): MatchState {
  return {
    doubles: cfg.doubles,
    bestOf: cfg.bestOf,
    players: cfg.players,
    court: cfg.court || '',
    sets: [],
    setTBs: [],
    curSet: [0, 0],
    curGame: [0, 0],
    inTiebreak: false,
    server: cfg.firstServer,
    serverIdx: [0, 0],
    tbPointsServed: 0,
    winner: null,
    matchOverSummary: null,
  };
}

export function awardPoint(state: MatchState, team: number): MatchState {
  if (state.winner !== null) return state;
  const next: MatchState = JSON.parse(JSON.stringify(state));

  if (next.inTiebreak) {
    next.curGame[team] += 1;
    const tbWinner = tiebreakWonBy(next.curGame as [number, number]);
    next.tbPointsServed = (next.tbPointsServed || 0) + 1;
    // Server swap inside tiebreak: serves 1st point, then alternates every 2 points
    if (next.tbPointsServed === 1 || (next.tbPointsServed - 1) % 2 === 0) {
      next.server = 1 - next.server;
      if (next.doubles)
        next.serverIdx[next.server] = 1 - next.serverIdx[next.server];
    }
    if (tbWinner !== null) {
      const finalSet = [...next.curSet] as [number, number];
      finalSet[tbWinner] += 1; // 7-6
      next.sets.push(finalSet);
      next.setTBs.push([...next.curGame] as [number, number]);
      next.curSet = [0, 0];
      next.curGame = [0, 0];
      next.inTiebreak = false;
      next.tbPointsServed = 0;
      const setsToWin = Math.ceil(next.bestOf / 2);
      const setsWonBy = (t: number) =>
        next.sets.filter((s) => s[t] > s[1 - t]).length;
      if (setsWonBy(tbWinner) >= setsToWin) {
        next.winner = tbWinner;
        next.matchOverSummary = next.sets.map((s) => s.join('–')).join(', ');
      }
    }
    return next;
  }

  // Regular point
  next.curGame[team] += 1;
  const gWinner = gameWonBy(next.curGame as [number, number]);
  if (gWinner === null) return next;

  // Game won
  next.curSet[gWinner] += 1;
  next.curGame = [0, 0];
  next.server = 1 - next.server;
  if (next.doubles)
    next.serverIdx[next.server] = 1 - next.serverIdx[next.server];

  const sWinner = setWonBy(next.curSet as [number, number], false);
  if (sWinner !== null) {
    next.sets.push([...next.curSet] as [number, number]);
    next.setTBs.push(null);
    next.curSet = [0, 0];
    const setsToWin = Math.ceil(next.bestOf / 2);
    const setsWonBy = (t: number) =>
      next.sets.filter((s) => s[t] > s[1 - t]).length;
    if (setsWonBy(sWinner) >= setsToWin) {
      next.winner = sWinner;
      next.matchOverSummary = next.sets.map((s) => s.join('–')).join(', ');
    }
  } else if (next.curSet[0] === 6 && next.curSet[1] === 6) {
    next.inTiebreak = true;
    next.tbPointsServed = 0;
  }

  return next;
}

export function pushHistory(
  history: MatchState[],
  state: MatchState
): MatchState[] {
  const next = [...history, state];
  if (next.length > 200) next.shift();
  return next;
}

export interface MatchState {
  doubles: boolean;
  bestOf: number;
  players: { names: string[] }[];
  court: string;
  sets: [number, number][];
  setTBs: ([number, number] | null)[];
  curSet: [number, number];
  curGame: [number, number];
  inTiebreak: boolean;
  server: number;
  serverIdx: [number, number];
  tbPointsServed: number;
  winner: number | null;
  matchOverSummary: string | null;
}

export interface Participant {
  id: string;
  names: string[];
}

export interface FixtureResult {
  winner: number;
  sets: [number, number][];
  setTBs: ([number, number] | null)[];
}

export interface Fixture {
  id: string;
  p0Id: string;
  p1Id: string;
  result: FixtureResult | null;
}

export interface Tournament {
  doubles: boolean;
  bestOf: number;
  court: string;
  participants: Participant[];
  fixtures: Fixture[];
  startedAt: number;
  ended?: boolean;
}

export type ViewType =
  | 'home'
  | 'quickSetup'
  | 'play'
  | 'tournSetup'
  | 'tourn'
  | 'leaderboard';

export interface Standing {
  id: string;
  names: string[];
  played: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
}

export interface MatchSetupConfig {
  doubles: boolean;
  bestOf: number;
  players: { names: string[] }[];
  firstServer: number;
  court: string;
}

export interface TournamentSetupConfig {
  doubles: boolean;
  bestOf: number;
  court: string;
  participants: Participant[];
}

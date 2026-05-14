import { type MouseEvent, useMemo, useState } from 'react';
import { Confetti } from './components/Confetti';
import { HomeScreen } from './components/HomeScreen';
import { Leaderboard } from './components/Leaderboard';
import { Scoreboard } from './components/Scoreboard';
import { SetupScreen } from './components/SetupScreen';
import { TopBar } from './components/TopBar';
import { TournamentSetup } from './components/TournamentSetup';
import { TournamentView } from './components/TournamentView';
import { WinnerBanner } from './components/WinnerBanner';
import { awardPoint, freshMatchState, pushHistory } from './logic/scoring';
import { computeStandings, generateRoundRobin } from './logic/tournament';
import type {
  MatchSetupConfig,
  MatchState,
  Tournament,
  TournamentSetupConfig,
  ViewType,
} from './types';

/**
 * Root component. Holds all app state (current view, match, tournament,
 * history for undo) and delegates rendering to per-screen components.
 *
 * To add a new screen, add a value to `ViewType` (in types.ts), then add a
 * render block in the JSX below. There's no router — just plain state switching.
 */
export function App() {
  const [view, setView] = useState<ViewType>('home');
  const [match, setMatch] = useState<MatchState | null>(null);
  const [history, setHistory] = useState<MatchState[]>([]);
  const [flashTeam, setFlashTeam] = useState<number | null>(null);
  const [bumpTeam, setBumpTeam] = useState<number | null>(null);
  const [confetti, setConfetti] = useState<number | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeFixtureId, setActiveFixtureId] = useState<string | null>(null);

  const standings = useMemo(
    () => (tournament ? computeStandings(tournament) : null),
    [tournament]
  );

  /* ----- Quick match ----- */
  const startQuickMatch = (cfg: MatchSetupConfig) => {
    setMatch(freshMatchState(cfg));
    setHistory([]);
    setView('play');
  };

  /* ----- Tournament ----- */
  const startTournament = (cfg: TournamentSetupConfig) => {
    const fixtures = generateRoundRobin(cfg.participants);
    setTournament({ ...cfg, fixtures, startedAt: Date.now() });
    setView('tourn');
  };

  const startFixtureMatch = (fixtureId: string) => {
    if (!tournament) return;
    const fx = tournament.fixtures.find((f) => f.id === fixtureId);
    if (!fx || fx.result) return;
    const p0 = tournament.participants.find((p) => p.id === fx.p0Id)!;
    const p1 = tournament.participants.find((p) => p.id === fx.p1Id)!;
    setMatch(
      freshMatchState({
        doubles: tournament.doubles,
        bestOf: tournament.bestOf,
        players: [{ names: p0.names }, { names: p1.names }],
        firstServer: 0,
        court: tournament.court || '',
      })
    );
    setHistory([]);
    setActiveFixtureId(fixtureId);
    setView('play');
  };

  const completeFixture = () => {
    if (!tournament || !activeFixtureId || !match || match.winner === null) return;
    const result = {
      winner: match.winner,
      sets: match.sets,
      setTBs: match.setTBs,
    };
    setTournament((t) =>
      t
        ? {
            ...t,
            fixtures: t.fixtures.map((f) =>
              f.id === activeFixtureId ? { ...f, result } : f
            ),
          }
        : t
    );
    setMatch(null);
    setActiveFixtureId(null);
    setHistory([]);
    setConfetti(null);
    setView('tourn');
  };

  const endTournament = () => {
    setTournament((t) => (t ? { ...t, ended: true } : t));
    setView('leaderboard');
  };

  /* ----- Point handlers ----- */
  const onPoint = (team: number, evt: MouseEvent<HTMLDivElement>) => {
    if (!match || match.winner !== null) return;
    setHistory((h) => pushHistory(h, match));
    const next = awardPoint(match, team);
    setMatch(next);
    if (evt) {
      const rect = evt.currentTarget.getBoundingClientRect();
      const rx = ((evt.clientX - rect.left) / rect.width) * 100 || 50;
      const ry = ((evt.clientY - rect.top) / rect.height) * 100 || 50;
      evt.currentTarget.style.setProperty('--rx', rx + '%');
      evt.currentTarget.style.setProperty('--ry', ry + '%');
    }
    setFlashTeam(team);
    setTimeout(() => setFlashTeam(null), 320);
    setBumpTeam(team);
    setTimeout(() => setBumpTeam(null), 450);
    if (next.winner !== null) setConfetti(Date.now());
  };

  const onUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setMatch(prev);
    setConfetti(null);
  };

  const onToggleServer = () => {
    if (!match || match.winner !== null) return;
    setHistory((h) => pushHistory(h, match));
    setMatch((m) => (m ? { ...m, server: 1 - m.server } : m));
  };

  const onSwapInnerServer = (team: number) => {
    if (!match || !match.doubles || match.winner !== null) return;
    setHistory((h) => pushHistory(h, match));
    setMatch((m) => {
      if (!m) return m;
      const next = JSON.parse(JSON.stringify(m)) as MatchState;
      next.serverIdx[team] = 1 - next.serverIdx[team];
      return next;
    });
  };

  /* ----- Navigation ----- */
  const inTournament = !!activeFixtureId;

  const goHome = () => {
    setView('home');
    setMatch(null);
    setHistory([]);
    setConfetti(null);
    setTournament(null);
    setActiveFixtureId(null);
  };

  const exitMatch = () => {
    if (inTournament) {
      setMatch(null);
      setHistory([]);
      setConfetti(null);
      setActiveFixtureId(null);
      setView('tourn');
    } else {
      goHome();
    }
  };

  const onWinnerContinue = () => {
    if (inTournament) {
      completeFixture();
    } else {
      goHome();
    }
  };

  return (
    <div className="stage">
      <TopBar
        view={view}
        match={match}
        tournament={tournament}
        inTournament={inTournament}
        onBack={view === 'play' ? exitMatch : null}
        onHome={goHome}
      />

      {view === 'home' && (
        <HomeScreen
          onQuick={() => setView('quickSetup')}
          onTourn={() => setView('tournSetup')}
        />
      )}
      {view === 'quickSetup' && (
        <SetupScreen onStart={startQuickMatch} onBack={goHome} />
      )}
      {view === 'tournSetup' && (
        <TournamentSetup onStart={startTournament} onBack={goHome} />
      )}
      {view === 'tourn' && tournament && standings && (
        <TournamentView
          tournament={tournament}
          standings={standings}
          onPlay={startFixtureMatch}
          onEnd={endTournament}
          onHome={goHome}
        />
      )}
      {view === 'play' && match && (
        <Scoreboard
          match={match}
          onPoint={onPoint}
          onUndo={onUndo}
          canUndo={history.length > 0}
          onToggleServer={onToggleServer}
          onSwapInnerServer={onSwapInnerServer}
          onExit={exitMatch}
          inTournament={inTournament}
          flashTeam={flashTeam}
          bumpTeam={bumpTeam}
        />
      )}
      {view === 'leaderboard' && tournament && standings && (
        <Leaderboard
          tournament={tournament}
          standings={standings}
          onNew={() => {
            setTournament(null);
            setActiveFixtureId(null);
            setView('tournSetup');
          }}
          onHome={goHome}
        />
      )}

      {match && match.winner !== null && view === 'play' && (
        <>
          <Confetti seed={confetti} />
          <WinnerBanner
            match={match}
            onContinue={onWinnerContinue}
            inTournament={inTournament}
          />
        </>
      )}
    </div>
  );
}

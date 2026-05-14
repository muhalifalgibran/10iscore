import type { Fixture, Participant, Standing, Tournament } from '../types';

export function generateRoundRobin(participants: Participant[]): Fixture[] {
  const fixtures: Fixture[] = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      fixtures.push({
        id: `f-${participants[i].id}-${participants[j].id}`,
        p0Id: participants[i].id,
        p1Id: participants[j].id,
        result: null,
      });
    }
  }
  return fixtures;
}

export function computeStandings(tournament: Tournament): Standing[] {
  const stats: Record<string, Standing> = {};
  tournament.participants.forEach((p) => {
    stats[p.id] = {
      id: p.id,
      names: p.names,
      played: 0,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0,
      points: 0,
    };
  });
  tournament.fixtures.forEach((fx) => {
    if (!fx.result) return;
    const { winner, sets } = fx.result;
    const wId = winner === 0 ? fx.p0Id : fx.p1Id;
    const lId = winner === 0 ? fx.p1Id : fx.p0Id;
    stats[wId].wins += 1;
    stats[lId].losses += 1;
    stats[wId].played += 1;
    stats[lId].played += 1;
    sets.forEach((s) => {
      const [g0, g1] = s;
      stats[fx.p0Id].gamesWon += g0;
      stats[fx.p0Id].gamesLost += g1;
      stats[fx.p1Id].gamesWon += g1;
      stats[fx.p1Id].gamesLost += g0;
      if (g0 > g1) {
        stats[fx.p0Id].setsWon += 1;
        stats[fx.p1Id].setsLost += 1;
      } else {
        stats[fx.p1Id].setsWon += 1;
        stats[fx.p0Id].setsLost += 1;
      }
    });
    stats[wId].points += 2;
  });
  // Tiebreakers: Pts → Wins → Set diff → Game diff → Games won
  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    const sa = a.setsWon - a.setsLost;
    const sb = b.setsWon - b.setsLost;
    if (sb !== sa) return sb - sa;
    const ga = a.gamesWon - a.gamesLost;
    const gb = b.gamesWon - b.gamesLost;
    if (gb !== ga) return gb - ga;
    return b.gamesWon - a.gamesWon;
  });
}

export function nameOf(p: { names: string[] }): string {
  return p.names.filter(Boolean).join(' / ') || '—';
}

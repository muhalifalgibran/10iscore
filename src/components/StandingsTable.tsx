import { nameOf } from '../logic/tournament';
import type { Standing } from '../types';

interface Props {
  standings: Standing[];
  full: boolean;
}

/** Standings table — compact (in tournament view) or full (in leaderboard). */
export function StandingsTable({ standings, full }: Props) {
  return (
    <table className="standings">
      <thead>
        <tr>
          <th />
          <th>{full ? 'Player / Team' : 'Name'}</th>
          <th className="num">W</th>
          <th className="num">L</th>
          {full && (
            <>
              <th className="num">Sets</th>
              <th className="num">Games</th>
            </>
          )}
          <th className="num">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, i) => (
          <tr key={s.id} className={i === 0 && s.played > 0 ? 'top' : ''}>
            <td className="rank">{i + 1}</td>
            <td className="name">{nameOf(s)}</td>
            <td className="num">{s.wins}</td>
            <td className="num">{s.losses}</td>
            {full && (
              <>
                <td className="num">
                  {s.setsWon}–{s.setsLost}
                </td>
                <td className="num">
                  {s.gamesWon}–{s.gamesLost}
                </td>
              </>
            )}
            <td className="num pts">{s.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

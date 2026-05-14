# 10iScore

A tennis scorekeeper website — quick singles/doubles matches, mini round-robin tournaments, share-ready leaderboard cards. Mobile-first, built with React + Vite + TypeScript.

## Run it

```bash
cd 10iscore-web
npm install
npm run dev
```

Then open the URL Vite prints (usually <http://localhost:5173>). The browser should open automatically.

To preview a production build:

```bash
npm run build
npm run preview
```

## Project layout

```
10iscore-web/
├── index.html                 ← HTML shell + Google Fonts <link>
├── package.json
├── vite.config.ts
├── tsconfig*.json
└── src/
    ├── main.tsx               ← React entry — mounts <App />
    ├── App.tsx                ← Root: state machine, navigation, point handlers
    ├── styles.css             ← All styling. One file, edit freely.
    ├── types.ts               ← TypeScript interfaces shared across files
    ├── logic/
    │   ├── scoring.ts         ← Tennis scoring (points → games → sets → match)
    │   ├── tournament.ts      ← Round-robin generator + standings calculator
    │   └── shareImage.ts      ← Canvas-based 1080×1350 PNG generator
    └── components/
        ├── TopBar.tsx
        ├── HomeScreen.tsx
        ├── SetupScreen.tsx        ← Quick match setup form
        ├── Scoreboard.tsx         ← Main scoring screen (TeamRow inside)
        ├── WinnerBanner.tsx
        ├── Confetti.tsx
        ├── TournamentSetup.tsx    ← Participant list
        ├── TournamentView.tsx     ← Fixtures + standings (FixtureRow inside)
        ├── StandingsTable.tsx
        ├── Leaderboard.tsx        ← Final standings + share button
        ├── ShareModal.tsx
        └── ConfirmModal.tsx
```

## Where to edit common things

| You want to… | Edit |
|---|---|
| Change colors / fonts / spacing | `src/styles.css` (CSS variables at top: `--court`, `--ball`, `--chalk`, `--radius`, etc.) |
| Adjust tennis rules (no-ad scoring, super-tiebreaks, etc.) | `src/logic/scoring.ts` |
| Change tournament tiebreaker order | `computeStandings` in `src/logic/tournament.ts` |
| Change the share image layout | `src/logic/shareImage.ts` |
| Add a new screen | Define it in `ViewType` (`src/types.ts`), then add a render block in `App.tsx` |
| Add a tournament format (knockout, etc.) | Add a generator in `src/logic/tournament.ts` and a setup option in `TournamentSetup.tsx` |

## Tech notes

- **No router.** The app is small enough that `App.tsx` switches between screens via a `view` state. Add to `ViewType` in `types.ts` to introduce more screens.
- **No state persistence.** Refreshing the page loses the current match/tournament. To persist, add `localStorage` reads/writes in `App.tsx` around `match` and `tournament` state.
- **Share image** is drawn on a `<canvas>` — works on any modern browser. On mobile, `navigator.share()` opens the native share sheet (Instagram, WhatsApp, etc.). On desktop or unsupported browsers, it falls back to a Download button.
- **Fonts** are loaded from Google Fonts via `<link>` in `index.html` — Instrument Serif (titles), Geist (UI), Geist Mono (scores).

## Features included

- Quick Match: singles or doubles, 1 set / Best of 3 / Best of 5
- Full scoring: 0/15/30/40, Deuce, Advantage, tiebreak at 6-6, match win
- Status pill updates live: Play → Deuce → Set point → Match point → Tiebreak
- Animations: tap ripple, score bump, ball pulse, confetti + winner banner
- Undo any action, swap server, swap doubles inner-server by tapping the ball
- Mini Tournament: round-robin auto-fixtures, live standings, end-early confirm
- Court / venue name (optional) shown in the top-bar and on the share card
- Share image: 1080×1350 Instagram-ready PNG with confetti, trophy, full standings

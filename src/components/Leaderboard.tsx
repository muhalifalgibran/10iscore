import { useState } from 'react';
import { generateShareImage } from '../logic/shareImage';
import { nameOf } from '../logic/tournament';
import type { Standing, Tournament } from '../types';
import { ShareLoading, ShareModal } from './ShareModal';
import { StandingsTable } from './StandingsTable';

interface Props {
  tournament: Tournament;
  standings: Standing[];
  onNew: () => void;
  onHome: () => void;
}

type ShareState = null | 'loading' | { blob: Blob; url: string };

/** Final leaderboard with trophy, champion name, full standings, share button. */
export function Leaderboard({ tournament, standings, onNew, onHome }: Props) {
  const champion = standings[0];
  const hasChampion = champion && champion.played > 0;
  const [shareState, setShareState] = useState<ShareState>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const openShare = async () => {
    setShareState('loading');
    setShareError(null);
    try {
      // Wait for custom fonts to be loaded before drawing the canvas
      if ('fonts' in document) {
        await document.fonts.ready;
      }
      const blob = await generateShareImage(tournament, standings);
      const url = URL.createObjectURL(blob);
      setShareState({ blob, url });
    } catch (e) {
      console.error(e);
      setShareError(e instanceof Error ? e.message : 'Failed to generate image');
      setShareState(null);
    }
  };

  const closeShare = () => {
    if (shareState && shareState !== 'loading' && 'url' in shareState) {
      URL.revokeObjectURL(shareState.url);
    }
    setShareState(null);
  };

  return (
    <div className="lboard">
      <div className="lboard-card">
        <div className="lboard-trophy">🏆</div>
        <div className="label">Champion</div>
        <div className="champ serif">
          {hasChampion ? nameOf(champion) : '—'}
        </div>
        <StandingsTable standings={standings} full={true} />
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button className="btn ghost" onClick={onHome}>
            ← Home
          </button>
          <button className="btn" onClick={onNew}>
            New tournament
          </button>
          <button
            className="btn primary"
            onClick={openShare}
            disabled={!hasChampion}
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
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v14" />
            </svg>
            Share
          </button>
        </div>
        {shareError && (
          <div style={{ color: 'var(--clay)', marginTop: 14, fontSize: 13 }}>
            {shareError}
          </div>
        )}
      </div>

      {shareState === 'loading' && <ShareLoading />}
      {shareState && shareState !== 'loading' && (
        <ShareModal
          imageUrl={shareState.url}
          blob={shareState.blob}
          filename={`10iscore-tournament-${new Date().toISOString().slice(0, 10)}.png`}
          shareTitle="Tournament Leaderboard"
          shareText="Final standings from our tennis tournament 🎾"
          onClose={closeShare}
        />
      )}
    </div>
  );
}

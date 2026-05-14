import { useState } from 'react';
import { generateMatchShareImage } from '../logic/shareImage';
import type { MatchState } from '../types';
import { ShareLoading, ShareModal } from './ShareModal';

interface Props {
  match: MatchState;
  onContinue: () => void;
  inTournament: boolean;
}

type ShareState = null | 'loading' | { blob: Blob; url: string };

/** Winner banner overlay with scoreline + CTA. */
export function WinnerBanner({ match, onContinue, inTournament }: Props) {
  const winner = match.winner!;
  const team = match.players[winner].names.join(' / ');
  const scoreline = match.sets
    .map((s, i) => {
      const tb = match.setTBs[i];
      if (tb) {
        const losing = Math.min(...tb);
        return `${s[winner]}–${s[1 - winner]}(${losing})`;
      }
      return `${s[winner]}–${s[1 - winner]}`;
    })
    .join('  ');

  const [shareState, setShareState] = useState<ShareState>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const openShare = async () => {
    setShareState('loading');
    setShareError(null);
    try {
      if ('fonts' in document) {
        await document.fonts.ready;
      }
      const blob = await generateMatchShareImage(match);
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
    <div className="banner">
      <div className="banner-card">
        <div className="small">Game · Set · Match</div>
        <div className="who serif">{team}</div>
        <div className="small">wins</div>
        <div className="scoreline mono">{scoreline}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={onContinue}>
            {inTournament ? 'Back to tournament →' : 'Home'}
          </button>
          {!inTournament && (
            <button className="btn" onClick={openShare}>
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
          )}
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
          filename={`10iscore-match-${new Date().toISOString().slice(0, 10)}.png`}
          shareTitle="Match Result"
          shareText="Just finished a match 🎾"
          onClose={closeShare}
        />
      )}
    </div>
  );
}

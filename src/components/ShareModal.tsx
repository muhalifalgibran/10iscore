import { useEffect, useState } from 'react';
import type { Tournament } from '../types';

interface Props {
  imageUrl: string;
  blob: Blob;
  tournament: Tournament;
  onClose: () => void;
}

/** Share modal — preview the generated PNG + native share OR download. */
export function ShareModal({ imageUrl, blob, tournament: _tournament, onClose }: Props) {
  const [status, setStatus] = useState<'shared' | 'downloaded' | null>(null);
  const filename = `10iscore-tournament-${new Date().toISOString().slice(0, 10)}.png`;

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    (() => {
      try {
        const f = new File([blob], filename, { type: 'image/png' });
        return navigator.canShare({ files: [f] });
      } catch {
        return false;
      }
    })();

  const handleShare = async () => {
    if (!canShareFiles) return;
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      await navigator.share({
        files: [file],
        title: 'Tournament Leaderboard',
        text: 'Final standings from our tennis tournament 🎾',
      });
      setStatus('shared');
    } catch {
      // user cancelled
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus('downloaded');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal share-modal">
        <div className="share-preview">
          <img src={imageUrl} alt="Tournament leaderboard" />
        </div>
        <div className="share-actions">
          {canShareFiles && (
            <button className="btn primary" onClick={handleShare}>
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
              Share to apps
            </button>
          )}
          <button
            className={`btn ${canShareFiles ? '' : 'primary'}`}
            onClick={handleDownload}
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            Download
          </button>
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
        {status && (
          <div className="share-toast">
            {status === 'shared' && 'Shared!'}
            {status === 'downloaded' && 'Downloaded ✓'}
          </div>
        )}
      </div>
    </div>
  );
}

/** A tiny loading modal shown while the share image is being generated. */
export function ShareLoading() {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'Instrument Serif, serif',
            fontStyle: 'italic',
            fontSize: 22,
            marginBottom: 6,
          }}
        >
          Cooking up your card…
        </div>
        <div style={{ color: 'var(--chalk-dim)', fontSize: 13 }}>
          Confetti loading.
        </div>
      </div>
    </div>
  );
}

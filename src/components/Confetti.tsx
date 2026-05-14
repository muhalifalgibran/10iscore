import { useMemo } from 'react';

interface Props {
  seed: number | null;
}

const COLORS = ['#d8f24a', '#f6f0dd', '#c66a3c', '#88b86a', '#ffffff'];

/** Falling confetti — 80 colorful dots with CSS animation. */
export function Confetti({ seed }: Props) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 80 }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 2 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 8,
      })),
    [seed]
  );

  return (
    <div className="confetti">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: p.left + '%',
            background: p.color,
            width: p.size,
            height: p.size,
            animationDuration: p.dur + 's',
            animationDelay: p.delay + 's',
            borderRadius: i % 3 === 0 ? 2 : '50%',
          }}
        />
      ))}
    </div>
  );
}

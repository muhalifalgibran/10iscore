import QRCode from 'qrcode';
import type { MatchState, Standing, Tournament } from '../types';
import { nameOf } from './tournament';

const APP_URL = 'https://10iscore.vercel.app/';

/** Draw bottom footer with QR + URL. Replaces simple "Scored on 10iScore" line. */
async function drawFooter(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
) {
  const qrSize = 180;
  const qrX = 80;
  const qrY = H - qrSize - 70;

  // QR with palette colors (cream bg, court green modules)
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, APP_URL, {
    width: qrSize,
    margin: 1,
    color: { dark: '#0e2a22', light: '#f6f0dd' },
    errorCorrectionLevel: 'M',
  });

  // Cream rounded backing
  const pad = 14;
  ctx.fillStyle = '#f6f0dd';
  const r = 14;
  const bx = qrX - pad;
  const by = qrY - pad;
  const bw = qrSize + pad * 2;
  const bh = qrSize + pad * 2;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
  ctx.arcTo(bx, by + bh, bx, by, r);
  ctx.arcTo(bx, by, bx + bw, by, r);
  ctx.closePath();
  ctx.fill();
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // Right side: tagline + URL
  const textX = qrX + qrSize + 50;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#cfc6ad';
  ctx.font = '600 14px "Geist", -apple-system, sans-serif';
  drawSpacedText(ctx, 'SCAN TO SCORE', textX, qrY + 30, 3);

  ctx.fillStyle = '#f6f0dd';
  ctx.font = 'italic 34px "Instrument Serif", Georgia, serif';
  ctx.fillText('Scored on 10iScore', textX, qrY + 76);

  ctx.fillStyle = '#d8f24a';
  ctx.font = '500 22px "Geist Mono", ui-monospace, monospace';
  ctx.fillText('10iscore.vercel.app', textX, qrY + 122);

  ctx.fillStyle = 'rgba(216,242,74,0.6)';
  ctx.font = '500 12px "Geist", -apple-system, sans-serif';
  drawSpacedText(ctx, 'GAME · SET · MATCH', textX, qrY + 160, 4);
}

/**
 * Generates a 1080×1350 Instagram-ready PNG of the tournament leaderboard.
 * Drawn on a canvas — no external libraries needed.
 */
export async function generateShareImage(
  tournament: Tournament,
  standings: Standing[]
): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const rounded = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Background: deep court green + radial glow
  ctx.fillStyle = '#0e2a22';
  ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, W * 0.95);
  g.addColorStop(0, 'rgba(27,71,56,0.9)');
  g.addColorStop(1, 'rgba(11,32,26,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W * 0.9, H * 1.1, 0, W * 0.9, H * 1.1, W);
  g.addColorStop(0, 'rgba(11,32,26,1)');
  g.addColorStop(1, 'rgba(11,32,26,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Court lines (subtle)
  ctx.strokeStyle = 'rgba(246,240,221,0.05)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();

  // Confetti — deterministic
  const colors = ['#d8f24a', '#f6f0dd', '#c66a3c', '#88b86a', '#ffffff'];
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < 120; i++) {
    const x = rand() * W;
    const y = rand() * rand() * H; // bias toward top
    const size = 4 + rand() * 12;
    const c = colors[Math.floor(rand() * colors.length)];
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.35 + rand() * 0.4;
    if (i % 4 === 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * Math.PI);
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Header brand: ball dot + 10i SCORE
  ctx.fillStyle = '#d8f24a';
  ctx.beginPath();
  ctx.arc(80, 90, 11, 0, Math.PI * 2);
  ctx.fill();
  const ballGlow = ctx.createRadialGradient(80, 90, 0, 80, 90, 28);
  ballGlow.addColorStop(0, 'rgba(216,242,74,0.4)');
  ballGlow.addColorStop(1, 'rgba(216,242,74,0)');
  ctx.fillStyle = ballGlow;
  ctx.beginPath();
  ctx.arc(80, 90, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f6f0dd';
  ctx.font = 'italic 38px "Instrument Serif", Georgia, serif';
  ctx.fillText('10i', 105, 90);
  ctx.fillStyle = '#cfc6ad';
  ctx.font = '500 16px "Geist", -apple-system, sans-serif';
  drawSpacedText(ctx, 'SCORE', 170, 92, 4);

  // Top-right date
  ctx.fillStyle = '#cfc6ad';
  ctx.font = '500 16px "Geist", -apple-system, sans-serif';
  ctx.textAlign = 'right';
  const dateStr = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  drawSpacedText(ctx, dateStr.toUpperCase(), W - 80, 92, 2);

  // Eyebrow
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d8f24a';
  ctx.font = '600 20px "Geist", -apple-system, sans-serif';
  drawSpacedText(ctx, 'TOURNAMENT CHAMPION', W / 2, 220, 6);

  // Court / venue (if provided)
  let courtY = 220;
  if (tournament.court) {
    ctx.fillStyle = '#cfc6ad';
    ctx.font = 'italic 22px "Instrument Serif", Georgia, serif';
    ctx.fillText('· ' + tournament.court + ' ·', W / 2, 260);
    courtY = 260;
  }

  // Trophy
  ctx.fillStyle = '#f6f0dd';
  ctx.font = '120px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', W / 2, courtY + 130);

  // Champion name
  const champion = standings[0];
  const champName = nameOf(champion);
  ctx.fillStyle = '#f6f0dd';
  let nameSize = 92;
  ctx.font = `italic ${nameSize}px "Instrument Serif", Georgia, serif`;
  while (ctx.measureText(champName).width > W - 140 && nameSize > 40) {
    nameSize -= 4;
    ctx.font = `italic ${nameSize}px "Instrument Serif", Georgia, serif`;
  }
  ctx.fillText(champName, W / 2, courtY + 250);

  // Subline meta
  ctx.fillStyle = '#cfc6ad';
  ctx.font = '500 18px "Geist", -apple-system, sans-serif';
  const meta = `${tournament.doubles ? 'Doubles' : 'Singles'} · ${tournament.bestOf === 1 ? '1 Set' : `Best of ${tournament.bestOf}`} · ${tournament.participants.length} ${tournament.doubles ? 'teams' : 'players'}`;
  ctx.fillText(meta, W / 2, courtY + 310);

  // Standings panel
  const padding = 80;
  const panelX = padding;
  const panelW = W - padding * 2;
  const panelY = courtY + 380;
  const maxRows = Math.min(standings.length, 8);
  const visible = standings.slice(0, maxRows);
  const headerH = 56;
  const rowH = Math.min(72, (H - panelY - 290 - headerH) / Math.max(maxRows, 1));
  const panelH = headerH + rowH * maxRows + 30;

  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  rounded(panelX, panelY, panelW, panelH, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(246,240,221,0.08)';
  ctx.lineWidth = 1.5;
  rounded(panelX, panelY, panelW, panelH, 22);
  ctx.stroke();

  const colRank = panelX + 50;
  const colName = panelX + 110;
  const colW = panelX + panelW - 360;
  const colL = panelX + panelW - 260;
  const colSets = panelX + panelW - 170;
  const colPts = panelX + panelW - 60;

  // Headers
  ctx.fillStyle = '#cfc6ad';
  ctx.font = '600 14px "Geist", -apple-system, sans-serif';
  ctx.textAlign = 'left';
  drawSpacedText(ctx, '#', colRank, panelY + headerH / 2 + 6, 1);
  drawSpacedText(
    ctx,
    tournament.doubles ? 'TEAM' : 'PLAYER',
    colName,
    panelY + headerH / 2 + 6,
    3
  );
  ctx.textAlign = 'center';
  drawSpacedText(ctx, 'W', colW, panelY + headerH / 2 + 6, 0);
  drawSpacedText(ctx, 'L', colL, panelY + headerH / 2 + 6, 0);
  drawSpacedText(ctx, 'SETS', colSets, panelY + headerH / 2 + 6, 2);
  ctx.textAlign = 'right';
  drawSpacedText(ctx, 'PTS', colPts, panelY + headerH / 2 + 6, 2);

  // Rows
  visible.forEach((s, i) => {
    const y = panelY + headerH + rowH / 2 + i * rowH;
    ctx.strokeStyle = 'rgba(246,240,221,0.06)';
    ctx.beginPath();
    ctx.moveTo(panelX + 30, y - rowH / 2);
    ctx.lineTo(panelX + panelW - 30, y - rowH / 2);
    ctx.stroke();

    const isTop = i === 0 && s.played > 0;

    // Rank
    ctx.fillStyle = isTop ? '#d8f24a' : '#cfc6ad';
    ctx.font = `${isTop ? 700 : 500} 26px "Geist Mono", ui-monospace, monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(String(i + 1), colRank, y);

    // Name (truncate if needed; crown for top)
    ctx.fillStyle = '#f6f0dd';
    ctx.font = `${isTop ? 600 : 500} 28px "Geist", -apple-system, sans-serif`;
    let label = nameOf(s);
    let labelToDraw = label;
    while (
      ctx.measureText((isTop ? '♛ ' : '') + labelToDraw).width >
        colW - colName - 30 &&
      labelToDraw.length > 4
    ) {
      labelToDraw = labelToDraw.slice(0, -2);
    }
    if (labelToDraw !== label) labelToDraw = labelToDraw.replace(/\s+$/, '') + '…';
    if (isTop) {
      ctx.fillStyle = '#d8f24a';
      ctx.fillText('♛', colName, y);
      ctx.fillStyle = '#f6f0dd';
      ctx.fillText(labelToDraw, colName + 36, y);
    } else {
      ctx.fillText(labelToDraw, colName, y);
    }

    // W
    ctx.font = '500 26px "Geist Mono", ui-monospace, monospace';
    ctx.fillStyle = '#f6f0dd';
    ctx.textAlign = 'center';
    ctx.fillText(String(s.wins), colW, y);
    // L
    ctx.fillStyle = '#cfc6ad';
    ctx.fillText(String(s.losses), colL, y);
    // Sets
    ctx.fillStyle = '#cfc6ad';
    ctx.font = '500 22px "Geist Mono", ui-monospace, monospace';
    ctx.fillText(`${s.setsWon}–${s.setsLost}`, colSets, y);

    // Pts
    ctx.fillStyle = '#d8f24a';
    ctx.font = '700 28px "Geist Mono", ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(String(s.points), colPts, y);
  });

  // Footer with QR
  await drawFooter(ctx, W, H);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
      'image/png',
      0.95
    )
  );
}

/**
 * Generates a 1080×1350 Instagram-ready PNG for a finished single match.
 */
export async function generateMatchShareImage(match: MatchState): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const rounded = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Background
  ctx.fillStyle = '#0e2a22';
  ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, W * 0.95);
  g.addColorStop(0, 'rgba(27,71,56,0.9)');
  g.addColorStop(1, 'rgba(11,32,26,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W * 0.9, H * 1.1, 0, W * 0.9, H * 1.1, W);
  g.addColorStop(0, 'rgba(11,32,26,1)');
  g.addColorStop(1, 'rgba(11,32,26,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Court lines
  ctx.strokeStyle = 'rgba(246,240,221,0.05)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();

  // Confetti
  const colors = ['#d8f24a', '#f6f0dd', '#c66a3c', '#88b86a', '#ffffff'];
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < 120; i++) {
    const x = rand() * W;
    const y = rand() * rand() * H;
    const size = 4 + rand() * 12;
    const c = colors[Math.floor(rand() * colors.length)];
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.35 + rand() * 0.4;
    if (i % 4 === 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * Math.PI);
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Header brand
  ctx.fillStyle = '#d8f24a';
  ctx.beginPath();
  ctx.arc(80, 90, 11, 0, Math.PI * 2);
  ctx.fill();
  const ballGlow = ctx.createRadialGradient(80, 90, 0, 80, 90, 28);
  ballGlow.addColorStop(0, 'rgba(216,242,74,0.4)');
  ballGlow.addColorStop(1, 'rgba(216,242,74,0)');
  ctx.fillStyle = ballGlow;
  ctx.beginPath();
  ctx.arc(80, 90, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f6f0dd';
  ctx.font = 'italic 38px "Instrument Serif", Georgia, serif';
  ctx.fillText('10i', 105, 90);
  ctx.fillStyle = '#cfc6ad';
  ctx.font = '500 16px "Geist", -apple-system, sans-serif';
  drawSpacedText(ctx, 'SCORE', 170, 92, 4);

  ctx.fillStyle = '#cfc6ad';
  ctx.font = '500 16px "Geist", -apple-system, sans-serif';
  ctx.textAlign = 'right';
  const dateStr = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  drawSpacedText(ctx, dateStr.toUpperCase(), W - 80, 92, 2);

  // Eyebrow
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d8f24a';
  ctx.font = '600 20px "Geist", -apple-system, sans-serif';
  drawSpacedText(ctx, 'GAME · SET · MATCH', W / 2, 220, 6);

  // Court line
  let courtY = 220;
  if (match.court) {
    ctx.fillStyle = '#cfc6ad';
    ctx.font = 'italic 22px "Instrument Serif", Georgia, serif';
    ctx.fillText('· ' + match.court + ' ·', W / 2, 260);
    courtY = 260;
  }

  // Trophy
  ctx.fillStyle = '#f6f0dd';
  ctx.font = '120px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', W / 2, courtY + 130);

  // Winner name
  const winner = match.winner!;
  const winnerName = match.players[winner].names.join(' / ');
  const loserName = match.players[1 - winner].names.join(' / ');

  const fitText = (text: string, maxW: number, startSize: number, style: string) => {
    let size = startSize;
    ctx.font = `${style} ${size}px "Instrument Serif", Georgia, serif`;
    while (ctx.measureText(text).width > maxW && size > 36) {
      size -= 4;
      ctx.font = `${style} ${size}px "Instrument Serif", Georgia, serif`;
    }
    return size;
  };

  ctx.fillStyle = '#f6f0dd';
  fitText(winnerName, W - 140, 92, 'italic');
  ctx.fillText(winnerName, W / 2, courtY + 250);

  ctx.fillStyle = '#cfc6ad';
  ctx.font = '500 18px "Geist", -apple-system, sans-serif';
  ctx.fillText('defeats', W / 2, courtY + 305);

  ctx.fillStyle = '#cfc6ad';
  fitText(loserName, W - 140, 36, 'italic');
  ctx.fillText(loserName, W / 2, courtY + 350);

  // Scoreline panel
  const padding = 80;
  const panelX = padding;
  const panelW = W - padding * 2;
  const panelY = courtY + 410;
  const sets = match.sets;
  const headerH = 56;
  const rowH = Math.min(96, (H - panelY - 330 - headerH) / 2);
  const panelH = headerH + rowH * 2 + 30;

  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  rounded(panelX, panelY, panelW, panelH, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(246,240,221,0.08)';
  ctx.lineWidth = 1.5;
  rounded(panelX, panelY, panelW, panelH, 22);
  ctx.stroke();

  // Header: SET 1, SET 2, ...
  const colNameX = panelX + 50;
  const setCount = sets.length;
  const setColStart = panelX + 360;
  const setColW = (panelX + panelW - 50 - setColStart) / Math.max(setCount, 1);

  ctx.fillStyle = '#cfc6ad';
  ctx.font = '600 14px "Geist", -apple-system, sans-serif';
  ctx.textAlign = 'left';
  drawSpacedText(
    ctx,
    match.doubles ? 'TEAM' : 'PLAYER',
    colNameX,
    panelY + headerH / 2 + 6,
    3
  );
  ctx.textAlign = 'center';
  sets.forEach((_, i) => {
    drawSpacedText(
      ctx,
      `SET ${i + 1}`,
      setColStart + setColW * (i + 0.5),
      panelY + headerH / 2 + 6,
      2
    );
  });

  // Two rows: winner first, then loser
  const order = [winner, 1 - winner];
  order.forEach((teamIdx, rowIdx) => {
    const y = panelY + headerH + rowH / 2 + rowIdx * rowH;
    ctx.strokeStyle = 'rgba(246,240,221,0.06)';
    ctx.beginPath();
    ctx.moveTo(panelX + 30, y - rowH / 2);
    ctx.lineTo(panelX + panelW - 30, y - rowH / 2);
    ctx.stroke();

    const isWinner = rowIdx === 0;

    // Name
    ctx.fillStyle = '#f6f0dd';
    ctx.font = `${isWinner ? 600 : 500} 28px "Geist", -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    const name = match.players[teamIdx].names.join(' / ');
    let labelToDraw = name;
    const maxNameW = setColStart - colNameX - 30 - (isWinner ? 36 : 0);
    while (ctx.measureText(labelToDraw).width > maxNameW && labelToDraw.length > 4) {
      labelToDraw = labelToDraw.slice(0, -2);
    }
    if (labelToDraw !== name) labelToDraw = labelToDraw.replace(/\s+$/, '') + '…';
    if (isWinner) {
      ctx.fillStyle = '#d8f24a';
      ctx.fillText('♛', colNameX, y);
      ctx.fillStyle = '#f6f0dd';
      ctx.fillText(labelToDraw, colNameX + 36, y);
    } else {
      ctx.fillStyle = '#cfc6ad';
      ctx.fillText(labelToDraw, colNameX, y);
    }

    // Set scores
    sets.forEach((s, i) => {
      const score = s[teamIdx];
      const tb = match.setTBs[i];
      const won = score > s[1 - teamIdx];
      ctx.fillStyle = won ? '#d8f24a' : '#cfc6ad';
      ctx.font = `${won ? 700 : 500} 44px "Geist Mono", ui-monospace, monospace`;
      ctx.textAlign = 'center';
      const cx = setColStart + setColW * (i + 0.5);
      ctx.fillText(String(score), cx, y);

      if (tb) {
        const losing = Math.min(...tb);
        const isLosingTB = tb[teamIdx] === losing;
        if (isLosingTB) {
          ctx.fillStyle = '#cfc6ad';
          ctx.font = '500 18px "Geist Mono", ui-monospace, monospace';
          ctx.fillText(`(${losing})`, cx + 34, y - 14);
        }
      }
    });
  });

  // Format meta
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cfc6ad';
  ctx.font = '500 18px "Geist", -apple-system, sans-serif';
  const meta = `${match.doubles ? 'Doubles' : 'Singles'} · ${match.bestOf === 1 ? '1 Set' : `Best of ${match.bestOf}`}`;
  ctx.fillText(meta, W / 2, panelY + panelH + 50);

  // Footer with QR
  await drawFooter(ctx, W, H);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
      'image/png',
      0.95
    )
  );
}

// Letter-spaced text helper (canvas has no native letter-spacing in older browsers)
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number
) {
  if (!spacing) {
    ctx.fillText(text, x, y);
    return;
  }
  const align = ctx.textAlign;
  if (align === 'center' || align === 'right') {
    let total = 0;
    for (let i = 0; i < text.length; i++) {
      total +=
        ctx.measureText(text[i]).width +
        (i < text.length - 1 ? spacing : 0);
    }
    let startX = align === 'center' ? x - total / 2 : x - total;
    ctx.textAlign = 'left';
    let cx = startX;
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], cx, y);
      cx += ctx.measureText(text[i]).width + spacing;
    }
    ctx.textAlign = align;
  } else {
    let cx = x;
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], cx, y);
      cx += ctx.measureText(text[i]).width + spacing;
    }
  }
}

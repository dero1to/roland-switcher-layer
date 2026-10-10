import type { PixelRect } from '../types';
import { W, H, COLORS } from './constants';

/** DSK 制作用ガイド画像（1920×1080 透過PNG）。PinP 領域を色付きで描く */
export function buildGuidePng(rects: (PixelRect & { id: number })[]): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  for (const r of rects) {
    const color = COLORS[r.id];
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = color;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);

    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(`PinP ${r.id}`, cx, cy - 28);
    ctx.font = '28px monospace';
    ctx.fillText(`X=${r.x} Y=${r.y}  ${r.w}×${r.h}`, cx, cy + 28);
    ctx.shadowBlur = 0;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('PNG 生成に失敗しました'))), 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

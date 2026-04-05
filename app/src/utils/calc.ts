import type { PinPParams, PixelRect } from '../types';
import { W, H } from './constants';

export function calcRect(p: Pick<PinPParams, 'cropH' | 'cropV' | 'posH' | 'posV' | 'zoom'>): PixelRect {
  const zf = p.zoom / 100;
  const visW = W * zf * (p.cropH / 100);
  const visH = H * zf * (p.cropV / 100);
  const x = (W - visW) * ((p.posH + 50) / 100);
  const y = (H - visH) * ((p.posV + 50) / 100);
  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(visW),
    h: Math.round(visH),
  };
}

export function detectOverlaps(rects: (PixelRect & { id: number })[]) {
  const overlaps: { a: number; b: number; x: number; y: number; w: number; h: number }[] = [];
  for (let a = 0; a < rects.length; a++) {
    for (let b = a + 1; b < rects.length; b++) {
      const ra = rects[a], rb = rects[b];
      const ox1 = Math.max(ra.x, rb.x);
      const oy1 = Math.max(ra.y, rb.y);
      const ox2 = Math.min(ra.x + ra.w, rb.x + rb.w);
      const oy2 = Math.min(ra.y + ra.h, rb.y + rb.h);
      if (ox1 < ox2 && oy1 < oy2) {
        overlaps.push({ a: ra.id, b: rb.id, x: ox1, y: oy1, w: ox2 - ox1, h: oy2 - oy1 });
      }
    }
  }
  return overlaps;
}

export function buildForwardExportJson(pinps: Record<number, PinPParams>) {
  const data: { resolution: string; pinps: unknown[] } = { resolution: '1920x1080', pinps: [] };
  for (let i = 1; i <= 4; i++) {
    const p = pinps[i];
    if (!p.enabled) continue;
    const r = calcRect(p);
    data.pinps.push({
      id: i,
      params: { cropH: p.cropH, cropV: p.cropV, posH: p.posH, posV: p.posV, zoom: p.zoom },
      pixel: r,
    });
  }
  return JSON.stringify(data, null, 2);
}

export function buildForwardExportText(pinps: Record<number, PinPParams>) {
  let text = `V-160HD PinP レイアウト (1920×1080)\n${'─'.repeat(40)}\n`;
  for (let i = 1; i <= 4; i++) {
    const p = pinps[i];
    if (!p.enabled) continue;
    const r = calcRect(p);
    text += `\nPinP ${i}\n  クロッピング: H(${p.cropH}%) V(${p.cropV}%)\n  小画面: H(${p.posH}%) V(${p.posV}%) Zoom(${p.zoom}%)\n  ピクセル: X=${r.x} Y=${r.y} W=${r.w} H=${r.h}\n`;
  }
  return text;
}

export function buildDskInfo(enabledRects: (PixelRect & { id: number })[], overlaps: ReturnType<typeof detectOverlaps>): string {
  if (enabledRects.length === 0) return 'PinP未設定。DSKは画面全体を使えます。';

  let minY = H, maxY = 0, minX = W, maxX = 0;
  for (const r of enabledRects) {
    minY = Math.min(minY, r.y);
    maxY = Math.max(maxY, r.y + r.h);
    minX = Math.min(minX, r.x);
    maxX = Math.max(maxX, r.x + r.w);
  }
  let html = '<strong>映像と干渉しない領域：</strong><br>';
  if (minY > 0) html += `上部 <code>${minY}px</code><br>`;
  if (H - maxY > 0) html += `下部 <code>${H - maxY}px</code><br>`;
  if (minX > 0) html += `左側 <code>${minX}px</code><br>`;
  if (W - maxX > 0) html += `右側 <code>${W - maxX}px</code><br>`;
  if (minY <= 0 && H - maxY <= 0 && minX <= 0 && W - maxX <= 0) html += '余白なし<br>';
  if (overlaps.length) {
    html += '<br><strong style="color:#d94a6e;">⚠ 重なり検出：</strong><br>';
    for (const o of overlaps) {
      const area = o.w * o.h;
      const pct = (area / (W * H) * 100).toFixed(1);
      html += `PinP ${o.a} × PinP ${o.b}：<code>${o.w}×${o.h}px</code>（${area.toLocaleString()}px² / ${pct}%）<br>`;
      html += `<span style="font-size:11px;color:#888;">位置 X=${o.x} Y=${o.y}〜X=${o.x + o.w} Y=${o.y + o.h}</span><br>`;
    }
  }
  return html;
}

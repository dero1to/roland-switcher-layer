import type { PinPParams, PixelRect, ReverseParams, ReverseRect } from '../types';
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

export function reverseCalcWithZoom(rect: PixelRect, zoomPct: number): ReverseParams | null {
  const { x, y, w, h } = rect;
  const zf = zoomPct / 100;
  const fullW = W * zf;
  const fullH = H * zf;
  if (fullW < 1 || fullH < 1) return null;

  const cropH = (w / fullW) * 100;
  const cropV = (h / fullH) * 100;
  if (cropH > 100.05 || cropV > 100.05) return null;

  const availX = W - w;
  const availY = H - h;
  const posH = availX > 0 ? (x / availX) * 100 - 50 : 0;
  const posV = availY > 0 ? (y / availY) * 100 - 50 : 0;

  const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
  return {
    zoom: parseFloat(zoomPct.toFixed(1)),
    cropH: clamp(parseFloat(cropH.toFixed(1)), 0.1, 100),
    cropV: clamp(parseFloat(cropV.toFixed(1)), 0.1, 100),
    posH: clamp(parseFloat(posH.toFixed(1)), -50, 50),
    posV: clamp(parseFloat(posV.toFixed(1)), -50, 50),
  };
}

export function getZoomRange(rect: PixelRect): { min: number; max: number } {
  const minZoom = Math.max(rect.w / W, rect.h / H) * 100;
  return { min: Math.max(0, parseFloat(minZoom.toFixed(1))), max: 100 };
}

export function defaultZoom(rect: PixelRect): number {
  return getZoomRange(rect).min;
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

export function buildReverseExportText(rects: ReverseRect[]) {
  let text = `V-160HD PinP 逆算結果 (1920×1080)\n${'─'.repeat(40)}\n`;
  for (const rect of rects) {
    if (rect.w <= 0 || rect.h <= 0) continue;
    const p = reverseCalcWithZoom(rect, rect.zoom);
    if (!p) continue;
    text += `\n矩形 ${rect.id} (X=${rect.x} Y=${rect.y} W=${rect.w} H=${rect.h})\n`;
    text += `  クロッピング: H(${p.cropH}%) V(${p.cropV}%)\n`;
    text += `  小画面: H(${p.posH}%) V(${p.posV}%) Zoom(${p.zoom}%)\n`;
  }
  return text;
}

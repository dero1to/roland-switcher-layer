import type { PixelRect } from '../types';
import { W, H } from './constants';

/** 出力解像度上の吸着距離（px） */
export const SNAP_THRESHOLD = 12;

/** edges: 辺を合わせる先 / centers: 中央を合わせる先 */
export interface AxisTargets {
  edges: number[];
  centers: number[];
}

/**
 * start〜start+size の辺は edges に、中央は centers に吸着させる（同距離なら先に並ぶ候補を優先）
 * @returns 吸着後の start と、吸着した基準線（なければ null）
 */
export function snapAxis(start: number, size: number, targets: AxisTargets, threshold = SNAP_THRESHOLD) {
  let best: { diff: number; guide: number } | null = null;
  const pairs: [number, number[]][] = [
    [start, targets.edges],
    [start + size, targets.edges],
    [start + size / 2, targets.centers],
  ];
  for (const [point, list] of pairs) {
    for (const t of list) {
      const diff = t - point;
      if (Math.abs(diff) <= threshold && (!best || Math.abs(diff) < Math.abs(best.diff))) {
        best = { diff, guide: t };
      }
    }
  }
  return best ? { value: start + best.diff, guide: best.guide } : { value: start, guide: null };
}

/**
 * 画面の端・中央と、他の PinP の辺・中央を吸着先にする。
 * 画面中央は分割レイアウト用に辺の吸着先にも含める
 */
export function snapTargets(others: PixelRect[]): { x: AxisTargets; y: AxisTargets } {
  const x: AxisTargets = { edges: [0, W, W / 2], centers: [W / 2] };
  const y: AxisTargets = { edges: [0, H, H / 2], centers: [H / 2] };
  for (const r of others) {
    x.edges.push(r.x, r.x + r.w);
    x.centers.push(Math.round(r.x + r.w / 2));
    y.edges.push(r.y, r.y + r.h);
    y.centers.push(Math.round(r.y + r.h / 2));
  }
  return { x, y };
}

/**
 * ピクセル位置 → 小画面 H/V（%、0.1刻み）
 * 0.1% 刻みだと 1〜2px ずれるため、丸め後のピクセルが一致する値を近傍から探す
 */
export function pixelToPos(px: number, avail: number): number {
  if (avail <= 0) return 0;
  const clampPos = (v: number) => Math.max(-50, Math.min(50, v));
  const fix1 = (v: number) => parseFloat(v.toFixed(1));
  const base = fix1((px / avail) * 100 - 50);
  const target = Math.round(px);
  for (const d of [0, -0.1, 0.1, -0.2, 0.2]) {
    const v = clampPos(fix1(base + d));
    if (Math.round(avail * ((v + 50) / 100)) === target) return v;
  }
  return clampPos(base);
}

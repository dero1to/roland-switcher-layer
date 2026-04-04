import type { PinPParams } from '../types';

// Compact format: array of [enabled, cropH, cropV, posH, posV, zoom, imgH, imgV, imgZoom, imageId]
type CompactPinP = [number, number, number, number, number, number, number, number, number, string];

function toCompact(p: PinPParams): CompactPinP {
  return [p.enabled ? 1 : 0, p.cropH, p.cropV, p.posH, p.posV, p.zoom, p.imgH, p.imgV, p.imgZoom, p.imageId];
}

function fromCompact(c: CompactPinP): PinPParams {
  return {
    enabled: c[0] === 1,
    cropH: c[1], cropV: c[2],
    posH: c[3], posV: c[4],
    zoom: c[5],
    imgH: c[6], imgV: c[7],
    imgZoom: c[8],
    imageId: c[9],
  };
}

export function encodePinps(pinps: Record<number, PinPParams>): string {
  const data = [1, 2, 3, 4].map(i => toCompact(pinps[i]));
  const json = JSON.stringify(data);
  return btoa(encodeURIComponent(json));
}

export function decodePinps(hash: string): Record<number, PinPParams> | null {
  try {
    const json = decodeURIComponent(atob(hash));
    const data: CompactPinP[] = JSON.parse(json);
    if (!Array.isArray(data) || data.length !== 4) return null;
    return { 1: fromCompact(data[0]), 2: fromCompact(data[1]), 3: fromCompact(data[2]), 4: fromCompact(data[3]) };
  } catch {
    return null;
  }
}

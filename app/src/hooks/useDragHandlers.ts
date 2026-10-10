import { useCallback, useEffect, useRef, useState } from 'react';
import type { PinPParams, PixelRect } from '../types';
import { W, H } from '../utils/constants';
import { calcRect } from '../utils/calc';
import { snapAxis, snapTargets, pixelToPos } from '../utils/snap';

type SetPinps = React.Dispatch<React.SetStateAction<Record<number, PinPParams>>>;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function fix1(v: number) {
  return parseFloat(v.toFixed(1));
}

export interface SnapGuides {
  x: number | null;
  y: number | null;
}

export function useDragHandlers(pinps: Record<number, PinPParams>, setPinps: SetPinps, clearPreset: () => void) {
  const pinpsRef = useRef(pinps);
  useEffect(() => { pinpsRef.current = pinps; }, [pinps]);
  /** 移動ドラッグ開始時の左上座標（px） */
  const originRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const [guides, setGuides] = useState<SnapGuides>({ x: null, y: null });

  /** dx/dy はドラッグ開始からの累積移動量（px）。snap=false で吸着しない */
  const handleRectDrag = useCallback((id: number, dx: number, dy: number, snap: boolean) => {
    const p = pinpsRef.current[id];
    if (!p?.enabled) return;
    const visW = W * (p.zoom / 100) * (p.cropH / 100);
    const visH = H * (p.zoom / 100) * (p.cropV / 100);
    const availX = W - visW;
    const availY = H - visH;
    if (originRef.current?.id !== id) {
      originRef.current = { id, x: availX * ((p.posH + 50) / 100), y: availY * ((p.posV + 50) / 100) };
    }
    let x = Math.max(0, Math.min(availX, originRef.current.x + dx));
    let y = Math.max(0, Math.min(availY, originRef.current.y + dy));
    let next: SnapGuides = { x: null, y: null };
    if (snap) {
      const others: PixelRect[] = [];
      for (let i = 1; i <= 4; i++) {
        if (i !== id && pinpsRef.current[i].enabled) others.push(calcRect(pinpsRef.current[i]));
      }
      const t = snapTargets(others);
      const sx = snapAxis(x, visW, t.x);
      const sy = snapAxis(y, visH, t.y);
      x = sx.value;
      y = sy.value;
      next = { x: sx.guide, y: sy.guide };
    }
    const posH = availX > 0 ? pixelToPos(x, availX) : p.posH;
    const posV = availY > 0 ? pixelToPos(y, availY) : p.posV;
    setPinps(prev => ({ ...prev, [id]: { ...prev[id], posH, posV } }));
    setGuides(g => (g.x === next.x && g.y === next.y ? g : next));
    clearPreset();
  }, [setPinps, clearPreset]);

  const endDrag = useCallback(() => {
    originRef.current = null;
    setGuides({ x: null, y: null });
  }, []);

  const handleZoomDrag = useCallback((id: number, dy: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p?.enabled) return prev;
      return { ...prev, [id]: { ...p, zoom: clamp(fix1(p.zoom - dy * 0.05), 0, 100) } };
    });
    clearPreset();
  }, [setPinps, clearPreset]);

  const handleImgZoomDrag = useCallback((id: number, dy: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p?.enabled) return prev;
      return { ...prev, [id]: { ...p, imgZoom: clamp(fix1(p.imgZoom - dy * 0.15), 100, 400) } };
    });
    clearPreset();
  }, [setPinps, clearPreset]);

  const handleCropHDrag = useCallback((id: number, dx: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p?.enabled) return prev;
      const fullW = W * (p.zoom / 100);
      const dCropH = fullW > 0 ? (dx / fullW) * 100 : 0;
      return { ...prev, [id]: { ...p, cropH: clamp(fix1(p.cropH + dCropH), 1, 100) } };
    });
    clearPreset();
  }, [setPinps, clearPreset]);

  const handleCropVDrag = useCallback((id: number, dy: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p?.enabled) return prev;
      const fullH = H * (p.zoom / 100);
      const dCropV = fullH > 0 ? (dy / fullH) * 100 : 0;
      return { ...prev, [id]: { ...p, cropV: clamp(fix1(p.cropV + dCropV), 1, 100) } };
    });
    clearPreset();
  }, [setPinps, clearPreset]);

  return { guides, endDrag, handleRectDrag, handleZoomDrag, handleImgZoomDrag, handleCropHDrag, handleCropVDrag };
}

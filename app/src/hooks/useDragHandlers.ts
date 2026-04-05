import { useCallback } from 'react';
import type { PinPParams } from '../types';
import { W, H } from '../utils/constants';

type SetPinps = React.Dispatch<React.SetStateAction<Record<number, PinPParams>>>;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function fix1(v: number) {
  return parseFloat(v.toFixed(1));
}

export function useDragHandlers(setPinps: SetPinps, clearPreset: () => void) {
  const handleRectDrag = useCallback((id: number, dx: number, dy: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p?.enabled) return prev;
      const visW = W * (p.zoom / 100) * (p.cropH / 100);
      const visH = H * (p.zoom / 100) * (p.cropV / 100);
      const availX = W - visW;
      const availY = H - visH;
      return {
        ...prev,
        [id]: {
          ...p,
          posH: clamp(fix1(p.posH + (availX > 0 ? (dx / availX) * 100 : 0)), -50, 50),
          posV: clamp(fix1(p.posV + (availY > 0 ? (dy / availY) * 100 : 0)), -50, 50),
        },
      };
    });
    clearPreset();
  }, [setPinps, clearPreset]);

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

  return { handleRectDrag, handleZoomDrag, handleImgZoomDrag, handleCropHDrag, handleCropVDrag };
}

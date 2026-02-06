import { useRef, useState, useCallback } from 'react';
import { W, H, COLOR_ARR } from '../utils/constants';

interface DrawOverlayProps {
  nextId: number;
  onDrawComplete: (x: number, y: number, w: number, h: number) => void;
}

export function DrawOverlay({ nextId, onDrawComplete }: DrawOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawRect, setDrawRect] = useState<{ left: string; top: string; width: string; height: string } | null>(null);
  const drawStart = useRef<{ xPx: number; yPx: number; monW: number; monH: number } | null>(null);

  const color = COLOR_ARR[(nextId - 1) % COLOR_ARR.length];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = overlayRef.current;
    if (!el) return;
    const monRect = el.getBoundingClientRect();
    drawStart.current = {
      xPx: e.clientX - monRect.left,
      yPx: e.clientY - monRect.top,
      monW: monRect.width,
      monH: monRect.height,
    };
    setDrawing(true);
    setDrawRect(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawing || !drawStart.current) return;
    const el = overlayRef.current;
    if (!el) return;
    const monRect = el.getBoundingClientRect();
    const cx = e.clientX - monRect.left;
    const cy = e.clientY - monRect.top;
    const s = drawStart.current;
    const x1 = Math.min(s.xPx, cx);
    const y1 = Math.min(s.yPx, cy);
    const x2 = Math.max(s.xPx, cx);
    const y2 = Math.max(s.yPx, cy);
    setDrawRect({
      left: `${(x1 / s.monW) * 100}%`,
      top: `${(y1 / s.monH) * 100}%`,
      width: `${((x2 - x1) / s.monW) * 100}%`,
      height: `${((y2 - y1) / s.monH) * 100}%`,
    });
  }, [drawing]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!drawing || !drawStart.current) return;
    setDrawing(false);
    setDrawRect(null);
    const el = overlayRef.current;
    if (!el) return;
    const monRect = el.getBoundingClientRect();
    const cx = e.clientX - monRect.left;
    const cy = e.clientY - monRect.top;
    const s = drawStart.current;
    const x1 = (Math.min(s.xPx, cx) / s.monW) * W;
    const y1 = (Math.min(s.yPx, cy) / s.monH) * H;
    const x2 = (Math.max(s.xPx, cx) / s.monW) * W;
    const y2 = (Math.max(s.yPx, cy) / s.monH) * H;
    const rw = x2 - x1;
    const rh = y2 - y1;
    if (rw > 20 && rh > 20) {
      onDrawComplete(x1, y1, rw, rh);
    }
    drawStart.current = null;
  }, [drawing, onDrawComplete]);

  const handleMouseLeave = useCallback(() => {
    if (drawing) {
      setDrawing(false);
      setDrawRect(null);
    }
  }, [drawing]);

  return (
    <div
      ref={overlayRef}
      className="draw-overlay"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {drawRect && (
        <div
          className="draw-rect"
          style={{
            ...drawRect,
            borderColor: color,
            background: `${color}1a`,
          }}
        />
      )}
    </div>
  );
}

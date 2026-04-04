import { useRef, useCallback, useEffect } from 'react';
import type { PixelRect } from '../types';
import { W, H } from '../utils/constants';

interface MonitorRectItem {
  id: number;
  rect: PixelRect;
  color?: string;
  label?: string;
}

interface MonitorProps {
  rects: MonitorRectItem[];
  onRectDrag?: (id: number, dx: number, dy: number) => void;
  onZoomDrag?: (id: number, dx: number, dy: number) => void;
  children?: React.ReactNode;
}

type DragMode = 'move' | 'zoom';

export function Monitor({ rects, onRectDrag, onZoomDrag, children }: MonitorProps) {
  const monitorRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; startX: number; startY: number; mode: DragMode } | null>(null);

  const startDrag = useCallback((e: React.MouseEvent, id: number, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, mode };
  }, []);

  useEffect(() => {
    if (!onRectDrag && !onZoomDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !monitorRef.current) return;
      const d = dragRef.current;
      const monRect = monitorRef.current.getBoundingClientRect();
      const dx = ((e.clientX - d.startX) / monRect.width) * W;
      const dy = ((e.clientY - d.startY) / monRect.height) * H;
      d.startX = e.clientX;
      d.startY = e.clientY;
      if (d.mode === 'move' && onRectDrag) {
        onRectDrag(d.id, dx, dy);
      } else if (d.mode === 'zoom' && onZoomDrag) {
        onZoomDrag(d.id, dx, dy);
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onRectDrag, onZoomDrag]);

  const interactive = !!(onRectDrag || onZoomDrag);

  return (
    <div className="monitor" ref={monitorRef}>
      <div className="monitor-grid" />
      <div className="monitor-center-h" />
      <div className="monitor-center-v" />
      <div className="dsk-outline" />
      <div className="dsk-badge">DSK</div>
      {rects.map((item) => {
        const r = item.rect;
        return (
          <div
            key={item.id}
            className={`pinp-rect${onRectDrag ? ' draggable' : ''}`}
            data-pinp={item.id}
            onMouseDown={onRectDrag ? (e) => startDrag(e, item.id, 'move') : undefined}
            style={{
              left: `${(r.x / W) * 100}%`,
              top: `${(r.y / H) * 100}%`,
              width: `${(r.w / W) * 100}%`,
              height: `${(r.h / H) * 100}%`,
              zIndex: 4 + item.id,
              borderColor: item.color || undefined,
              background: item.color
                ? `${item.color}11`
                : undefined,
            }}
          >
            <div className="pinp-rect-label" style={item.color ? { color: item.color } : undefined}>
              {item.label || `PinP ${item.id}`}
              <small>{r.w}&times;{r.h}</small>
            </div>
            {interactive && (
              <div
                className="pinp-zoom-handle"
                onMouseDown={(e) => startDrag(e, item.id, 'zoom')}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="7" r="5" />
                  <line x1="10.5" y1="10.5" x2="14" y2="14" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
      {children}
    </div>
  );
}

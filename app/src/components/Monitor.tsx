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
  children?: React.ReactNode;
}

export function Monitor({ rects, onRectDrag, children }: MonitorProps) {
  const monitorRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; startX: number; startY: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: number) => {
    if (!onRectDrag) return;
    e.preventDefault();
    dragRef.current = { id, startX: e.clientX, startY: e.clientY };
  }, [onRectDrag]);

  useEffect(() => {
    if (!onRectDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !monitorRef.current) return;
      const monRect = monitorRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragRef.current.startX) / monRect.width) * W;
      const dy = ((e.clientY - dragRef.current.startY) / monRect.height) * H;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      onRectDrag(dragRef.current.id, dx, dy);
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
  }, [onRectDrag]);

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
            onMouseDown={onRectDrag ? (e) => handleMouseDown(e, item.id) : undefined}
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
          </div>
        );
      })}
      {children}
    </div>
  );
}

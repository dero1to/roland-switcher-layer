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
  onZoomDrag?: (id: number, dy: number) => void;
  onImgZoomDrag?: (id: number, dy: number) => void;
  onCropHDrag?: (id: number, dx: number) => void;
  onCropVDrag?: (id: number, dy: number) => void;
  children?: React.ReactNode;
}

type DragMode = 'move' | 'zoom' | 'imgZoom' | 'cropH' | 'cropHInv' | 'cropV' | 'cropVInv';

export function Monitor({ rects, onRectDrag, onZoomDrag, onImgZoomDrag, onCropHDrag, onCropVDrag, children }: MonitorProps) {
  const monitorRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; startX: number; startY: number; mode: DragMode } | null>(null);

  const startDrag = useCallback((e: React.MouseEvent, id: number, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, mode };
  }, []);

  useEffect(() => {
    if (!onRectDrag && !onZoomDrag && !onImgZoomDrag && !onCropHDrag && !onCropVDrag) return;

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
        onZoomDrag(d.id, dy);
      } else if (d.mode === 'imgZoom' && onImgZoomDrag) {
        onImgZoomDrag(d.id, dy);
      } else if (d.mode === 'cropH' && onCropHDrag) {
        onCropHDrag(d.id, dx);
      } else if (d.mode === 'cropHInv' && onCropHDrag) {
        onCropHDrag(d.id, -dx);
      } else if (d.mode === 'cropV' && onCropVDrag) {
        onCropVDrag(d.id, dy);
      } else if (d.mode === 'cropVInv' && onCropVDrag) {
        onCropVDrag(d.id, -dy);
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
  }, [onRectDrag, onZoomDrag, onImgZoomDrag, onCropHDrag, onCropVDrag]);

  const interactive = !!(onRectDrag || onZoomDrag || onImgZoomDrag || onCropHDrag || onCropVDrag);

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
              <>
                {/* 左辺: 外(左)に引くと広がる / 右辺: 外(右)に引くと広がる */}
                <div
                  className="pinp-handle pinp-handle-crop-h pinp-handle-left"
                  title="クロッピング H（外に引くと広がる）"
                  onMouseDown={(e) => startDrag(e, item.id, 'cropHInv')}
                />
                <div
                  className="pinp-handle pinp-handle-crop-h pinp-handle-right"
                  title="クロッピング H（外に引くと広がる）"
                  onMouseDown={(e) => startDrag(e, item.id, 'cropH')}
                />
                {/* 上辺: 外(上)に引くと広がる / 下辺: 外(下)に引くと広がる */}
                <div
                  className="pinp-handle pinp-handle-crop-v pinp-handle-top"
                  title="クロッピング V（外に引くと広がる）"
                  onMouseDown={(e) => startDrag(e, item.id, 'cropVInv')}
                />
                <div
                  className="pinp-handle pinp-handle-crop-v pinp-handle-bottom"
                  title="クロッピング V（外に引くと広がる）"
                  onMouseDown={(e) => startDrag(e, item.id, 'cropV')}
                />
                {/* 右下: 小画面 Zoom */}
                <div
                  className="pinp-handle pinp-handle-circle pinp-handle-zoom"
                  title="小画面 Zoom（上下ドラッグ）"
                  onMouseDown={(e) => startDrag(e, item.id, 'zoom')}
                >
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="7" cy="7" r="5" />
                    <line x1="10.5" y1="10.5" x2="14" y2="14" />
                  </svg>
                </div>
                {/* 左上: 映像 Zoom */}
                <div
                  className="pinp-handle pinp-handle-circle pinp-handle-img-zoom"
                  title="映像 Zoom（上下ドラッグ）"
                  onMouseDown={(e) => startDrag(e, item.id, 'imgZoom')}
                >
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="7" cy="7" r="5" />
                    <line x1="10.5" y1="10.5" x2="14" y2="14" />
                    <line x1="5" y1="7" x2="9" y2="7" />
                    <line x1="7" y1="5" x2="7" y2="9" />
                  </svg>
                </div>
              </>
            )}
          </div>
        );
      })}
      {children}
    </div>
  );
}

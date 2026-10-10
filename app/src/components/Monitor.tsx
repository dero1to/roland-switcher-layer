import { useRef, useCallback, useEffect } from 'react';
import type { PixelRect } from '../types';
import { W, H } from '../utils/constants';

interface MonitorRectItem {
  id: number;
  rect: PixelRect;
  color?: string;
  label?: string;
  imageUrl?: string | null;
  sourceView?: { visibleW: number; visibleH: number; offsetX: number; offsetY: number };
}

interface MonitorProps {
  rects: MonitorRectItem[];
  /** dx/dy はドラッグ開始からの累積（px）。snap は Shift 非押下時 true */
  onRectDrag?: (id: number, dx: number, dy: number, snap: boolean) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  guides?: { x: number | null; y: number | null };
  onZoomDrag?: (id: number, dy: number) => void;
  onImgZoomDrag?: (id: number, dy: number) => void;
  onCropHDrag?: (id: number, dx: number) => void;
  onCropVDrag?: (id: number, dy: number) => void;
  dsk?: { url: string; level: number } | null;
  selectedId?: number;
  onSelect?: (id: number) => void;
  children?: React.ReactNode;
}

type DragMode = 'move' | 'zoom' | 'imgZoom' | 'cropH' | 'cropHInv' | 'cropV' | 'cropVInv';

export function Monitor({ rects, onRectDrag, onZoomDrag, onImgZoomDrag, onCropHDrag, onCropVDrag, onDragStart, onDragEnd, guides, dsk, selectedId, onSelect, children }: MonitorProps) {
  const monitorRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; pointerId: number; originX: number; originY: number; startX: number; startY: number; mode: DragMode } | null>(null);

  const startDrag = useCallback((e: React.PointerEvent, id: number, mode: DragMode) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(id);
    onDragStart?.();
    dragRef.current = { id, pointerId: e.pointerId, originX: e.clientX, originY: e.clientY, startX: e.clientX, startY: e.clientY, mode };
  }, [onSelect, onDragStart]);

  useEffect(() => {
    if (!onRectDrag && !onZoomDrag && !onImgZoomDrag && !onCropHDrag && !onCropVDrag) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current || !monitorRef.current) return;
      const d = dragRef.current;
      if (e.pointerId !== d.pointerId) return;
      const monRect = monitorRef.current.getBoundingClientRect();
      const dx = ((e.clientX - d.startX) / monRect.width) * W;
      const dy = ((e.clientY - d.startY) / monRect.height) * H;
      d.startX = e.clientX;
      d.startY = e.clientY;
      if (d.mode === 'move' && onRectDrag) {
        const totalX = ((e.clientX - d.originX) / monRect.width) * W;
        const totalY = ((e.clientY - d.originY) / monRect.height) * H;
        onRectDrag(d.id, totalX, totalY, !e.shiftKey);
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

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragRef.current || e.pointerId !== dragRef.current.pointerId) return;
      dragRef.current = null;
      onDragEnd?.();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [onRectDrag, onZoomDrag, onImgZoomDrag, onCropHDrag, onCropVDrag, onDragEnd]);

  const interactive = !!(onRectDrag || onZoomDrag || onImgZoomDrag || onCropHDrag || onCropVDrag);

  return (
    <div className="monitor" ref={monitorRef}>
      <div className="monitor-grid" />
      <div className="monitor-center-h" />
      <div className="monitor-center-v" />
      {dsk && (
        <div
          className="dsk-image"
          style={{ backgroundImage: `url(${dsk.url})`, opacity: dsk.level / 100 }}
        />
      )}
      <div className="dsk-outline" />
      <div className="dsk-badge">DSK</div>
      {rects.map((item) => {
        const r = item.rect;
        return (
          <div
            key={item.id}
            className={`pinp-rect${onRectDrag ? ' draggable' : ''}${item.imageUrl ? ' has-image' : ''}${selectedId === item.id ? ' selected' : ''}`}
            data-pinp={item.id}
            onPointerDown={onRectDrag ? (e) => startDrag(e, item.id, 'move') : onSelect ? () => onSelect(item.id) : undefined}
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
            {item.imageUrl && item.sourceView && (
              <div className="pinp-image-clip">
                <div
                  className="pinp-image"
                  style={{
                    backgroundImage: `url(${item.imageUrl})`,
                    width: `${10000 / item.sourceView.visibleW}%`,
                    height: `${10000 / item.sourceView.visibleH}%`,
                    left: `${(-item.sourceView.offsetX * 100) / item.sourceView.visibleW}%`,
                    top: `${(-item.sourceView.offsetY * 100) / item.sourceView.visibleH}%`,
                  }}
                />
              </div>
            )}
            <div className="pinp-rect-label" style={item.color ? { color: item.color } : undefined}>
              {item.label || `PinP ${item.id}`}
              <small>{r.w}&times;{r.h}</small>
            </div>
            {interactive && (selectedId === undefined || selectedId === item.id) && (
              <>
                {/* 左辺: 外(左)に引くと広がる / 右辺: 外(右)に引くと広がる */}
                <div
                  className="pinp-handle pinp-handle-crop-h pinp-handle-left"
                  title="クロッピング H（外に引くと広がる）"
                  onPointerDown={(e) => startDrag(e, item.id, 'cropHInv')}
                />
                <div
                  className="pinp-handle pinp-handle-crop-h pinp-handle-right"
                  title="クロッピング H（外に引くと広がる）"
                  onPointerDown={(e) => startDrag(e, item.id, 'cropH')}
                />
                {/* 上辺: 外(上)に引くと広がる / 下辺: 外(下)に引くと広がる */}
                <div
                  className="pinp-handle pinp-handle-crop-v pinp-handle-top"
                  title="クロッピング V（外に引くと広がる）"
                  onPointerDown={(e) => startDrag(e, item.id, 'cropVInv')}
                />
                <div
                  className="pinp-handle pinp-handle-crop-v pinp-handle-bottom"
                  title="クロッピング V（外に引くと広がる）"
                  onPointerDown={(e) => startDrag(e, item.id, 'cropV')}
                />
                {/* 右下: 小画面 Zoom */}
                <div
                  className="pinp-handle pinp-handle-circle pinp-handle-zoom"
                  title="小画面 Zoom（上下ドラッグ）"
                  onPointerDown={(e) => startDrag(e, item.id, 'zoom')}
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
                  onPointerDown={(e) => startDrag(e, item.id, 'imgZoom')}
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
      {guides?.x != null && <div className="snap-guide snap-guide-v" style={{ left: `${(guides.x / W) * 100}%` }} />}
      {guides?.y != null && <div className="snap-guide snap-guide-h" style={{ top: `${(guides.y / H) * 100}%` }} />}
      {children}
    </div>
  );
}

import { useState, useCallback, useRef } from 'react';
import type { ReverseRect } from '../types';
import { COLOR_ARR, SAMPLE_IMAGES, W, H } from '../utils/constants';
import { reverseCalcWithZoom, defaultZoom, buildReverseExportText } from '../utils/calc';
import { ReverseSidebar } from './ReverseSidebar';
import { Monitor } from './Monitor';
import { DrawOverlay } from './DrawOverlay';

interface ReverseModeProps {
  dskImage: string | null;
}

export function ReverseMode({ dskImage }: ReverseModeProps) {
  const [rects, setRects] = useState<ReverseRect[]>([]);
  const nextIdRef = useRef(1);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addRect = useCallback((x: number, y: number, w: number, h: number) => {
    const id = nextIdRef.current++;
    const color = COLOR_ARR[(id - 1) % COLOR_ARR.length];
    const imageId = SAMPLE_IMAGES[(id - 1) % SAMPLE_IMAGES.length].id;
    const r: ReverseRect = {
      id,
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(w),
      h: Math.round(h),
      color,
      zoom: 0,
      imageId,
    };
    r.zoom = defaultZoom(r);
    setRects(prev => [...prev, r]);
  }, []);

  const updateRect = useCallback((id: number, updates: Partial<ReverseRect>) => {
    setRects(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...updates };
      // If pixel values changed, recalculate default zoom if needed
      if ('x' in updates || 'y' in updates || 'w' in updates || 'h' in updates) {
        // Keep the current zoom - user may have adjusted it
      }
      return updated;
    }));
  }, []);

  const removeRect = useCallback((id: number) => {
    setRects(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleAddDefault = useCallback(() => {
    addRect(W / 4, H / 4, W / 2, H / 2);
  }, [addRect]);

  const showToast = useCallback(() => {
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1500);
  }, []);

  const copyRevText = useCallback(() => {
    navigator.clipboard.writeText(buildReverseExportText(rects)).then(showToast);
  }, [rects, showToast]);

  // Build monitor rects
  const monitorRects = rects
    .filter(r => r.w > 0 && r.h > 0)
    .map(r => ({
      id: r.id,
      rect: { x: r.x, y: r.y, w: r.w, h: r.h },
      color: r.color,
      label: `矩形 ${r.id}`,
    }));

  // Summary
  let summaryHtml = '';
  if (rects.length === 0) {
    summaryHtml = '矩形を追加してください';
  } else {
    for (const rect of rects) {
      if (rect.w <= 0 || rect.h <= 0) continue;
      const p = reverseCalcWithZoom(rect, rect.zoom);
      if (!p) {
        summaryHtml += `<strong style="color:${rect.color}">矩形 ${rect.id}</strong> — Zoom値を確認してください<br>`;
        continue;
      }
      summaryHtml += `<strong style="color:${rect.color}">矩形 ${rect.id}</strong>（${rect.x}, ${rect.y}, ${rect.w}×${rect.h}）<br>`;
      summaryHtml += `&nbsp;&nbsp;Crop H:<code>${p.cropH}%</code> V:<code>${p.cropV}%</code> `;
      summaryHtml += `Pos H:<code>${p.posH}%</code> V:<code>${p.posV}%</code> `;
      summaryHtml += `Zoom:<code>${p.zoom}%</code><br>`;
    }
  }

  return (
    <>
      <ReverseSidebar
        rects={rects}
        onUpdateRect={updateRect}
        onRemoveRect={removeRect}
        onAddRect={handleAddDefault}
      />
      <div className="main">
        <div>
          <div className="preview-label">プレビュー — モニター上をドラッグして矩形を描画</div>
          <Monitor rects={monitorRects} dskImage={dskImage}>
            <DrawOverlay nextId={nextIdRef.current} onDrawComplete={addRect} />
          </Monitor>
        </div>
        <div className="output-section">
          <div className="output-card full-width">
            <h4>逆算結果サマリー</h4>
            <div className="dsk-info" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
          </div>
        </div>
        <div className="export-bar">
          <button className="export-btn primary" onClick={copyRevText}>V-160HD設定値コピー</button>
          <span className={`toast${toastVisible ? ' show' : ''}`}>コピーしました</span>
        </div>
      </div>
    </>
  );
}

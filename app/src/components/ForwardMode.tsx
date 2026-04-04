import { useState, useCallback, useRef, useEffect } from 'react';
import type { PinPParams, PixelRect } from '../types';
import { PRESETS, COLORS, W, H } from '../utils/constants';
import { calcRect, detectOverlaps, buildForwardExportJson, buildForwardExportText } from '../utils/calc';
import { ForwardSidebar } from './ForwardSidebar';
import { Monitor } from './Monitor';

const STORAGE_KEY = 'v160hd-saved-slots';

interface SavedSlot {
  name: string;
  pinps: Record<number, PinPParams>;
}

function loadSlots(): (SavedSlot | null)[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [null, null, null, null, null];
}

function saveSlots(slots: (SavedSlot | null)[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

interface ForwardModeProps {
  pinps: Record<number, PinPParams>;
  setPinps: React.Dispatch<React.SetStateAction<Record<number, PinPParams>>>;
}

export function ForwardMode({ pinps, setPinps }: ForwardModeProps) {
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [slots, setSlots] = useState<(SavedSlot | null)[]>(loadSlots);
  useEffect(() => { saveSlots(slots); }, [slots]);

  const handleSaveSlot = useCallback((idx: number) => {
    const name = prompt('保存名を入力', slots[idx]?.name || `保存${idx + 1}`);
    if (name === null) return;
    setSlots(prev => {
      const next = [...prev];
      next[idx] = { name: name || `保存${idx + 1}`, pinps: JSON.parse(JSON.stringify(pinps)) };
      return next;
    });
  }, [pinps, slots]);

  const handleLoadSlot = useCallback((idx: number) => {
    const slot = slots[idx];
    if (!slot) return;
    setPinps(slot.pinps);
    setActivePreset(null);
  }, [slots, setPinps]);

  const handleDeleteSlot = useCallback((idx: number) => {
    setSlots(prev => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  }, []);

  const handleUpdate = useCallback((id: number, updates: Partial<PinPParams>) => {
    setPinps(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
    setActivePreset(null);
  }, [setPinps]);

  const handleRectDrag = useCallback((id: number, dx: number, dy: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p || !p.enabled) return prev;
      const zf = p.zoom / 100;
      const visW = W * zf * (p.cropH / 100);
      const visH = H * zf * (p.cropV / 100);
      const availX = W - visW;
      const availY = H - visH;
      const dPosH = availX > 0 ? (dx / availX) * 100 : 0;
      const dPosV = availY > 0 ? (dy / availY) * 100 : 0;
      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
      return {
        ...prev,
        [id]: {
          ...p,
          posH: clamp(parseFloat((p.posH + dPosH).toFixed(1)), -50, 50),
          posV: clamp(parseFloat((p.posV + dPosV).toFixed(1)), -50, 50),
        },
      };
    });
    setActivePreset(null);
  }, [setPinps]);

  const handleZoomDrag = useCallback((id: number, dy: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p || !p.enabled) return prev;
      const dZoom = -dy * 0.05;
      const zoom = Math.max(0, Math.min(100, parseFloat((p.zoom + dZoom).toFixed(1))));
      return { ...prev, [id]: { ...p, zoom } };
    });
    setActivePreset(null);
  }, [setPinps]);

  const handleImgZoomDrag = useCallback((id: number, dy: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p || !p.enabled) return prev;
      const dImgZoom = -dy * 0.15;
      const imgZoom = Math.max(100, Math.min(400, parseFloat((p.imgZoom + dImgZoom).toFixed(1))));
      return { ...prev, [id]: { ...p, imgZoom } };
    });
    setActivePreset(null);
  }, [setPinps]);

  const handleCropHDrag = useCallback((id: number, dx: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p || !p.enabled) return prev;
      // dx > 0 → 右に広げる → cropH増加
      const zf = p.zoom / 100;
      const fullW = W * zf;
      const dCropH = fullW > 0 ? (dx / fullW) * 100 : 0;
      const cropH = Math.max(1, Math.min(100, parseFloat((p.cropH + dCropH).toFixed(1))));
      return { ...prev, [id]: { ...p, cropH } };
    });
    setActivePreset(null);
  }, [setPinps]);

  const handleCropVDrag = useCallback((id: number, dy: number) => {
    setPinps(prev => {
      const p = prev[id];
      if (!p || !p.enabled) return prev;
      // dy > 0 → 下に広げる → cropV増加
      const zf = p.zoom / 100;
      const fullH = H * zf;
      const dCropV = fullH > 0 ? (dy / fullH) * 100 : 0;
      const cropV = Math.max(1, Math.min(100, parseFloat((p.cropV + dCropV).toFixed(1))));
      return { ...prev, [id]: { ...p, cropV } };
    });
    setActivePreset(null);
  }, [setPinps]);

  const handleToggle = useCallback((id: number) => {
    setPinps(prev => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
    setActivePreset(null);
  }, [setPinps]);

  const applyPreset = useCallback((idx: number) => {
    const pr = PRESETS[idx];
    setPinps(prev => {
      const next = { ...prev };
      for (let i = 1; i <= 4; i++) {
        const currentImageId = prev[i].imageId;
        next[i] = { ...JSON.parse(JSON.stringify(pr.config[i])), imageId: currentImageId };
      }
      return next;
    });
    setActivePreset(idx);
  }, [setPinps]);

  const showToast = useCallback(() => {
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1500);
  }, []);

  const copyJson = useCallback(() => {
    navigator.clipboard.writeText(buildForwardExportJson(pinps)).then(showToast);
  }, [pinps, showToast]);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(buildForwardExportText(pinps)).then(showToast);
  }, [pinps, showToast]);

  const copyShareUrl = useCallback(() => {
    navigator.clipboard.writeText(location.href).then(showToast);
  }, [showToast]);

  // Compute rects and DSK info
  const enabledRects: (PixelRect & { id: number })[] = [];
  for (let i = 1; i <= 4; i++) {
    if (!pinps[i].enabled) continue;
    const r = calcRect(pinps[i]);
    enabledRects.push({ id: i, ...r });
  }

  const overlaps = detectOverlaps(enabledRects);

  // DSK info
  let dskHtml = '';
  if (enabledRects.length === 0) {
    dskHtml = 'PinP未設定。DSKは画面全体を使えます。';
  } else {
    let minY = H, maxY = 0, minX = W, maxX = 0;
    for (const r of enabledRects) {
      minY = Math.min(minY, r.y);
      maxY = Math.max(maxY, r.y + r.h);
      minX = Math.min(minX, r.x);
      maxX = Math.max(maxX, r.x + r.w);
    }
    dskHtml = '<strong>映像と干渉しない領域：</strong><br>';
    if (minY > 0) dskHtml += `上部 <code>${minY}px</code><br>`;
    if (H - maxY > 0) dskHtml += `下部 <code>${H - maxY}px</code><br>`;
    if (minX > 0) dskHtml += `左側 <code>${minX}px</code><br>`;
    if (W - maxX > 0) dskHtml += `右側 <code>${W - maxX}px</code><br>`;
    if (minY <= 0 && H - maxY <= 0 && minX <= 0 && W - maxX <= 0) dskHtml += '余白なし<br>';
    if (overlaps.length) {
      dskHtml += '<br><strong style="color:#d94a6e;">⚠ 重なり検出：</strong><br>';
      for (const o of overlaps) {
        const area = o.w * o.h;
        const pct = (area / (W * H) * 100).toFixed(1);
        dskHtml += `PinP ${o.a} × PinP ${o.b}：<code>${o.w}×${o.h}px</code>（${area.toLocaleString()}px² / ${pct}%）<br>`;
        dskHtml += `<span style="font-size:11px;color:#888;">位置 X=${o.x} Y=${o.y}〜X=${o.x + o.w} Y=${o.y + o.h}</span><br>`;
      }
    }
  }

  const presetsContent = (
    <div className="toolbar-group">
      {PRESETS.map((pr, idx) => (
        <button
          key={idx}
          className={`preset-btn${activePreset === idx ? ' active' : ''}`}
          title={pr.desc}
          onClick={() => applyPreset(idx)}
        >
          {pr.name}
        </button>
      ))}
    </div>
  );

  const slotsContent = (
    <div className="toolbar-group">
      {slots.map((slot, idx) => (
        <div key={idx} className="save-slot">
          {slot ? (
            <>
              <button className="slot-load" onClick={() => handleLoadSlot(idx)} title="読み込む">
                {slot.name}
              </button>
              <button className="slot-overwrite" onClick={() => handleSaveSlot(idx)} title="上書き保存">↻</button>
              <button className="slot-delete" onClick={() => handleDeleteSlot(idx)} title="削除">×</button>
            </>
          ) : (
            <button className="slot-empty" onClick={() => handleSaveSlot(idx)}>
              {idx + 1}
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const exportContent = (
    <div className="toolbar-group">
      <button className="export-btn primary" onClick={copyShareUrl}>共有URL</button>
      <button className="export-btn" onClick={copyJson}>JSON</button>
      <button className="export-btn" onClick={copyText}>テキスト</button>
      <span className={`toast${toastVisible ? ' show' : ''}`}>コピーしました</span>
    </div>
  );

  return (
    <>
      <div className="main">
        {/* Desktop: toolbar */}
        <div className="toolbar">
          {presetsContent}
          <div className="toolbar-sep" />
          {slotsContent}
        </div>
        <div className="monitor-wrap">
          <Monitor
            rects={enabledRects.map(r => ({ id: r.id, rect: r }))}
            onRectDrag={handleRectDrag}
            onZoomDrag={handleZoomDrag}
            onImgZoomDrag={handleImgZoomDrag}
            onCropHDrag={handleCropHDrag}
            onCropVDrag={handleCropVDrag}
          />
        </div>
        {/* Desktop: bottom bar */}
        <div className="bottom-bar">
          <div className="output-card">
            <h4>ピクセル座標</h4>
            <table className="coord-table">
              <thead>
                <tr><th>PinP</th><th>X</th><th>Y</th><th>W</th><th>H</th></tr>
              </thead>
              <tbody>
                {enabledRects.map(r => (
                  <tr key={r.id}>
                    <td className="pinp-name" style={{ color: COLORS[r.id] }}>PinP {r.id}</td>
                    <td>{r.x}</td>
                    <td>{r.y}</td>
                    <td>{r.w}</td>
                    <td>{r.h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="output-card">
            <h4>DSK設計情報</h4>
            <div className="dsk-info" dangerouslySetInnerHTML={{ __html: dskHtml }} />
          </div>
          <div className="output-card export-card">
            <h4>エクスポート</h4>
            {exportContent}
          </div>
        </div>
        {/* Mobile: single collapsible panel */}
        <div className={`mobile-tools${mobileToolsOpen ? ' open' : ''}`}>
          <button className="mobile-tools-toggle" onClick={() => setMobileToolsOpen(v => !v)}>
            ツール {mobileToolsOpen ? '▾' : '▸'}
          </button>
          <div className="mobile-tools-body">
            <div className="mobile-tools-section">
              <div className="mobile-tools-label">プリセット</div>
              {presetsContent}
            </div>
            <div className="mobile-tools-section">
              <div className="mobile-tools-label">保存スロット</div>
              {slotsContent}
            </div>
            <div className="mobile-tools-section">
              <div className="mobile-tools-label">ピクセル座標</div>
              <table className="coord-table">
                <thead>
                  <tr><th>PinP</th><th>X</th><th>Y</th><th>W</th><th>H</th></tr>
                </thead>
                <tbody>
                  {enabledRects.map(r => (
                    <tr key={r.id}>
                      <td className="pinp-name" style={{ color: COLORS[r.id] }}>PinP {r.id}</td>
                      <td>{r.x}</td>
                      <td>{r.y}</td>
                      <td>{r.w}</td>
                      <td>{r.h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-tools-section">
              <div className="mobile-tools-label">DSK設計情報</div>
              <div className="dsk-info" dangerouslySetInnerHTML={{ __html: dskHtml }} />
            </div>
            <div className="mobile-tools-section">
              <div className="mobile-tools-label">エクスポート</div>
              {exportContent}
            </div>
          </div>
        </div>
      </div>
      <ForwardSidebar pinps={pinps} onUpdate={handleUpdate} onToggle={handleToggle} />
    </>
  );
}

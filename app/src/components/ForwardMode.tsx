import { useState, useCallback, useRef } from 'react';
import type { PinPParams, PixelRect } from '../types';
import { PRESETS, COLORS, W, H } from '../utils/constants';
import { calcRect, detectOverlaps, buildForwardExportJson, buildForwardExportText } from '../utils/calc';
import { ForwardSidebar } from './ForwardSidebar';
import { Monitor } from './Monitor';

interface ForwardModeProps {
  pinps: Record<number, PinPParams>;
  setPinps: React.Dispatch<React.SetStateAction<Record<number, PinPParams>>>;
  dskImage: string | null;
}

export function ForwardMode({ pinps, setPinps, dskImage }: ForwardModeProps) {
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUpdate = useCallback((id: number, updates: Partial<PinPParams>) => {
    setPinps(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
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

  return (
    <>
      <ForwardSidebar pinps={pinps} onUpdate={handleUpdate} onToggle={handleToggle} />
      <div className="main">
        <div>
          <div className="preview-label">プリセット</div>
          <div className="presets">
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
        </div>
        <div>
          <div className="preview-label">プレビュー</div>
          <Monitor rects={enabledRects.map(r => ({ id: r.id, rect: r }))} dskImage={dskImage} />
        </div>
        <div className="output-section">
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
        </div>
        <div className="export-bar">
          <button className="export-btn primary" onClick={copyJson}>JSON コピー</button>
          <button className="export-btn" onClick={copyText}>テキスト コピー</button>
          <span className={`toast${toastVisible ? ' show' : ''}`}>コピーしました</span>
        </div>
      </div>
    </>
  );
}

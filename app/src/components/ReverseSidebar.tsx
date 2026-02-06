import type { ReverseRect } from '../types';
import { GRID_LABELS, SAMPLE_IMAGES, W, H } from '../utils/constants';
import { reverseCalcWithZoom, getZoomRange, calcRect } from '../utils/calc';
import { ImageSelector } from './ImageSelector';

interface ReverseSidebarProps {
  rects: ReverseRect[];
  onUpdateRect: (id: number, updates: Partial<ReverseRect>) => void;
  onRemoveRect: (id: number) => void;
  onAddRect: () => void;
}

function ReverseResult({ rect }: { rect: ReverseRect }) {
  if (rect.w <= 0 || rect.h <= 0) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>有効なサイズを入力してください</span>;
  }

  const p = reverseCalcWithZoom(rect, rect.zoom);
  if (!p) {
    return <span style={{ color: '#d94a6e', fontSize: '11px' }}>このZoom値ではCropが100%を超えます。Zoomを上げてください。</span>;
  }

  const verify = calcRect({ cropH: p.cropH, cropV: p.cropV, posH: p.posH, posV: p.posV, zoom: p.zoom });
  const hasError = Math.abs(verify.w - rect.w) > 1 || Math.abs(verify.h - rect.h) > 1 ||
    Math.abs(verify.x - rect.x) > 1 || Math.abs(verify.y - rect.y) > 1;

  const cropW = Math.round(W * p.cropH / 100);
  const cropHPx = Math.round(H * p.cropV / 100);
  const imgData = SAMPLE_IMAGES.find(img => img.id === rect.imageId) || SAMPLE_IMAGES[0];
  const imagePath = imgData.path;

  return (
    <>
      <div className="rev-result-title">V-160HD パラメータ</div>
      <div className="rev-result-row"><span className="rev-result-key">クロッピング H</span><span className="rev-result-val">{p.cropH}%</span></div>
      <div className="rev-result-row"><span className="rev-result-key">クロッピング V</span><span className="rev-result-val">{p.cropV}%</span></div>
      <div className="rev-result-row"><span className="rev-result-key">小画面 H</span><span className="rev-result-val">{p.posH}%</span></div>
      <div className="rev-result-row"><span className="rev-result-key">小画面 V</span><span className="rev-result-val">{p.posV}%</span></div>
      <div className="rev-result-row"><span className="rev-result-key">小画面 Zoom</span><span className="rev-result-val">{p.zoom}%</span></div>
      {hasError && (
        <div className="rev-result-note">⚠ 丸め誤差（実際: {verify.w}&times;{verify.h} @ {verify.x},{verify.y}）</div>
      )}
      <div className="crop-preview-wrap">
        <div className="crop-preview-title">入力映像のクロップ領域</div>
        <div className="crop-preview">
          <div
            className={`crop-preview-full${imagePath ? ' has-image' : ''}`}
            style={imagePath ? { backgroundImage: `url(${imagePath})` } : undefined}
          >
            {GRID_LABELS.map((label, i) => (
              <div key={i} className="grid-cell">{label}</div>
            ))}
          </div>
          <div className="crop-preview-area" style={{
            left: `${p.cropH < 100 ? (100 - p.cropH) / 2 : 0}%`,
            top: `${p.cropV < 100 ? (100 - p.cropV) / 2 : 0}%`,
            width: `${p.cropH}%`,
            height: `${p.cropV}%`,
          }} />
          <div className="crop-preview-size">{cropW}&times;{cropHPx}px</div>
          <div className="crop-preview-label">1920&times;1080</div>
        </div>
      </div>
    </>
  );
}

export function ReverseSidebar({ rects, onUpdateRect, onRemoveRect, onAddRect }: ReverseSidebarProps) {
  return (
    <div className="sidebar">
      <div className="reverse-sidebar-intro">
        <strong>逆算モード</strong><br />
        ピクセル座標を指定 → Zoomを自由に調整 → CropH/V・位置が連動<br />
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>モニター上ドラッグでも矩形追加可</span>
      </div>

      {rects.map((rect) => {
        const range = getZoomRange(rect);
        return (
          <div key={rect.id} className="rev-pinp-section">
            <div className="rev-pinp-header">
              <h3>
                <span className="dot" style={{ background: rect.color }} />
                矩形 {rect.id}
              </h3>
              <button className="rev-remove-btn" onClick={() => onRemoveRect(rect.id)}>
                ✕ 削除
              </button>
            </div>

            <div className="param-group-title">ピクセル指定</div>
            <div className="rev-input-grid">
              {(['x', 'y', 'w', 'h'] as const).map(key => (
                <div key={key} className="rev-input-group">
                  <span className="rev-input-label">{key.toUpperCase()}</span>
                  <input
                    type="number"
                    className="rev-input"
                    value={rect[key]}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      onUpdateRect(rect.id, { [key]: v });
                    }}
                  />
                </div>
              ))}
            </div>

            <ImageSelector
              selectedId={rect.imageId}
              onChange={(id) => onUpdateRect(rect.id, { imageId: id })}
            />

            <div className="param-group" style={{ marginTop: '12px' }}>
              <div className="param-group-title">Zoom（自由調整）</div>
              <div className="param-row">
                <span className="param-label">Zoom</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={rect.zoom}
                  onChange={(e) => onUpdateRect(rect.id, { zoom: parseFloat(e.target.value) })}
                />
                <input
                  type="text"
                  className="param-value"
                  value={`${rect.zoom.toFixed(1)}%`}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).value = rect.zoom.toFixed(1);
                    (e.target as HTMLInputElement).select();
                  }}
                  onBlur={(e) => {
                    let v = parseFloat(e.target.value);
                    if (isNaN(v)) v = rect.zoom;
                    v = Math.max(0, Math.min(100, v));
                    onUpdateRect(rect.id, { zoom: v });
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                />
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                有効範囲: {range.min}% 〜 {range.max}%
              </div>
            </div>

            <div className="rev-result">
              <ReverseResult rect={rect} />
            </div>
          </div>
        );
      })}

      <div style={{ padding: '12px 20px' }}>
        <button className="rev-add-btn" onClick={onAddRect}>＋ 矩形を追加</button>
      </div>
    </div>
  );
}

import type { PinPParams } from '../types';
import { W, H, GRID_LABELS, SAMPLE_IMAGES } from '../utils/constants';

interface CropPreviewProps {
  params: PinPParams;
}

export function CropPreview({ params: p }: CropPreviewProps) {
  const imgZf = p.imgZoom / 100;
  const visibleW = p.cropH / imgZf;
  const visibleH = p.cropV / imgZf;
  const visibleWpx = Math.round(W * visibleW / 100);
  const visibleHpx = Math.round(H * visibleH / 100);
  const offsetX = (100 - visibleW) * ((p.imgH + 50) / 100);
  const offsetY = (100 - visibleH) * ((p.imgV + 50) / 100);

  const imgData = SAMPLE_IMAGES.find(img => img.id === p.imageId) || SAMPLE_IMAGES[0];
  const imagePath = imgData.path;

  return (
    <div className="crop-preview-wrap">
      <div className="crop-preview-title">入力映像の使用領域</div>
      <div className="crop-preview">
        <div
          className={`crop-preview-full${imagePath ? ' has-image' : ''}`}
          style={imagePath ? { backgroundImage: `url(${imagePath})` } : undefined}
        >
          {GRID_LABELS.map((label, i) => (
            <div key={i} className="grid-cell">{label}</div>
          ))}
        </div>
        {p.imgZoom > 100 && (
          <div style={{
            position: 'absolute',
            left: `${(100 - p.cropH) / 2}%`,
            top: `${(100 - p.cropV) / 2}%`,
            width: `${p.cropH}%`,
            height: `${p.cropV}%`,
            border: '2px dashed rgba(255,255,255,0.4)',
            zIndex: 3,
            pointerEvents: 'none',
          }} />
        )}
        <div className="crop-preview-area" style={{
          left: `${offsetX}%`,
          top: `${offsetY}%`,
          width: `${visibleW}%`,
          height: `${visibleH}%`,
        }} />
        <div className="crop-preview-size">{visibleWpx}&times;{visibleHpx}px</div>
        <div className="crop-preview-label">1920&times;1080</div>
      </div>
      {p.imgZoom > 100 && (
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
          点線=クロップ枠 / 実線=映像Zoom {p.imgZoom}%後
        </div>
      )}
    </div>
  );
}

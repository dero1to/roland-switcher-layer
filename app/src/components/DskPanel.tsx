import type { DskSettings, DskKeyMode } from '../types';
import { ImageSelector } from './ImageSelector';
import { ParamSlider } from './ParamSlider';

interface DskPanelProps {
  dsk: DskSettings;
  onChange: (updates: Partial<DskSettings>) => void;
  imageUrl: string | null;
}

const MODES: { value: DskKeyMode; label: string; desc: string }[] = [
  { value: 'alpha', label: 'アルファ', desc: 'PNG等のアルファチャンネルで抜く' },
  { value: 'fillKey', label: 'Fill / Key', desc: 'Key画像の輝度で Fill画像を抜く（白=表示）' },
];

export function DskPanel({ dsk, onChange, imageUrl }: DskPanelProps) {
  return (
    <div className="sidebar-section-body">
      <div className="param-group">
        <div className="param-group-title">キーモード</div>
        <div className="segmented">
          {MODES.map(m => (
            <button
              key={m.value}
              className={`segmented-btn${dsk.mode === m.value ? ' active' : ''}`}
              title={m.desc}
              onClick={() => onChange({ mode: m.value })}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="dsk-mode-desc">{MODES.find(m => m.value === dsk.mode)?.desc}</div>
      </div>

      <ImageSelector
        title={dsk.mode === 'fillKey' ? 'Fill 画像' : 'DSK 画像（アルファ付き）'}
        selectedId={dsk.fillId}
        onChange={(id) => onChange({ fillId: id })}
        showSamples={false}
        allowNone
      />

      {dsk.mode === 'fillKey' && (
        <>
          <ImageSelector
            title="Key 画像（白=不透明 / 黒=透明）"
            selectedId={dsk.keyId}
            onChange={(id) => onChange({ keyId: id })}
            showSamples={false}
            allowNone
          />
          <label className="dsk-check">
            <input type="checkbox" checked={dsk.keyInvert} onChange={(e) => onChange({ keyInvert: e.target.checked })} />
            Key 反転
          </label>
        </>
      )}

      <div className="param-group">
        <div className="param-group-title">DSK レベル</div>
        <ParamSlider
          param={{ label: 'Level', min: 0, max: 100, step: 1, unit: '%' }}
          value={dsk.level}
          onChange={(v) => onChange({ level: v })}
        />
      </div>

      <div className="crop-preview-wrap">
        <div className="crop-preview-title">DSK プレビュー（市松=透明部分）</div>
        <div className="dsk-preview checker">
          {imageUrl && <img src={imageUrl} alt="" style={{ opacity: dsk.level / 100 }} />}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { Mode, PinPParams } from './types';
import { PRESETS } from './utils/constants';
import { decodePinps } from './utils/share';
import { ForwardMode } from './components/ForwardMode';
import { ReverseMode } from './components/ReverseMode';

function getInitialPinps(): Record<number, PinPParams> {
  // Try to restore from URL hash
  const hash = location.hash.slice(1);
  if (hash) {
    const decoded = decodePinps(hash);
    if (decoded) return decoded;
  }

  const pr = PRESETS[0];
  return {
    1: { ...JSON.parse(JSON.stringify(pr.config[1])), imageId: 'person' },
    2: { ...JSON.parse(JSON.stringify(pr.config[2])), imageId: 'slide' },
    3: { ...JSON.parse(JSON.stringify(pr.config[3])), imageId: 'room' },
    4: { ...JSON.parse(JSON.stringify(pr.config[4])), imageId: 'grid' },
  };
}

export default function App() {
  const [mode, setMode] = useState<Mode>('forward');
  const [pinps, setPinps] = useState<Record<number, PinPParams>>(getInitialPinps);

  return (
    <div className="app">
      <div className="header">
        <h1>V-160HD PinP レイアウトビルダー</h1>
        <div className="pipe" />
        <span className="subtitle">DSKオーバーレイデザイン用</span>
        <span className="badge">1920 × 1080</span>
      </div>

      <div className="mode-tabs">
        <button
          className={`mode-tab${mode === 'forward' ? ' active' : ''}`}
          onClick={() => setMode('forward')}
        >
          <span className="mode-icon">▶</span>パラメータ → プレビュー
        </button>
        <button
          className={`mode-tab${mode === 'reverse' ? ' active' : ''}`}
          onClick={() => setMode('reverse')}
        >
          <span className="mode-icon">◀</span>ピクセル → パラメータ逆算
        </button>
      </div>

      {mode === 'forward' ? (
        <ForwardMode pinps={pinps} setPinps={setPinps} />
      ) : (
        <ReverseMode />
      )}
    </div>
  );
}

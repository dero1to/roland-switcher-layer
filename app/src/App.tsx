import { useState, useEffect } from 'react';
import type { PinPParams } from './types';
import { PRESETS } from './utils/constants';
import { decodePinps, encodePinps } from './utils/share';
import { ForwardMode } from './components/ForwardMode';

function getInitialPinps(): Record<number, PinPParams> {
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
  const [pinps, setPinps] = useState<Record<number, PinPParams>>(getInitialPinps);

  useEffect(() => {
    history.replaceState(null, '', `#${encodePinps(pinps)}`);
  }, [pinps]);

  return (
    <div className="app">
      <div className="header">
        <h1>V-160HD PinP レイアウトビルダー</h1>
        <div className="pipe" />
        <span className="subtitle">DSKオーバーレイデザイン用</span>
        <span className="badge">1920 × 1080</span>
      </div>

      <ForwardMode pinps={pinps} setPinps={setPinps} />
    </div>
  );
}

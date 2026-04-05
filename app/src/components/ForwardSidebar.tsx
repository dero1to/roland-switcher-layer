import { useState } from 'react';
import type { PinPParams } from '../types';
import { COLORS, PARAMS } from '../utils/constants';
import { ParamSlider } from './ParamSlider';
import { ImageSelector } from './ImageSelector';
import { CropPreview } from './CropPreview';

interface ForwardSidebarProps {
  pinps: Record<number, PinPParams>;
  onUpdate: (id: number, updates: Partial<PinPParams>) => void;
  onToggle: (id: number) => void;
}

export function ForwardSidebar({ pinps, onUpdate, onToggle }: ForwardSidebarProps) {
  const [active, setActive] = useState(1);
  const p = pinps[active];

  return (
    <div className="sidebar">
      <div className="pinp-tabs">
        {[1, 2, 3, 4].map((i) => (
          <button
            key={i}
            className={`pinp-tab${active === i ? ' active' : ''}`}
            style={{ '--tab-color': COLORS[i] } as React.CSSProperties}
            onClick={() => setActive(i)}
          >
            <span className="dot" style={{ background: COLORS[i] }} />
            <span>PinP {i}</span>
            <button
              className={`pinp-toggle pinp-toggle-sm${pinps[i].enabled ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggle(i); }}
            />
          </button>
        ))}
      </div>
      <div className="pinp-panel">
        {p.enabled ? (
          <div className="sidebar-section-body">
            {PARAMS.map((group) => (
              <div key={group.group} className="param-group">
                <div className="param-group-title">{group.group}</div>
                {group.items.map((item) => (
                  <ParamSlider
                    key={item.key}
                    param={item}
                    value={p[item.key] as number}
                    onChange={(v) => onUpdate(active, { [item.key]: v })}
                  />
                ))}
              </div>
            ))}
            <ImageSelector
              selectedId={p.imageId}
              onChange={(id) => onUpdate(active, { imageId: id })}
            />
            <CropPreview params={p} />
          </div>
        ) : (
          <div className="pinp-disabled">PinP {active} は無効です</div>
        )}
      </div>
    </div>
  );
}

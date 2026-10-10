import { useState } from 'react';
import type { PinPParams, DskSettings } from '../types';
import { COLORS, PARAMS } from '../utils/constants';
import { ParamSlider } from './ParamSlider';
import { ImageSelector } from './ImageSelector';
import { CropPreview } from './CropPreview';
import { DskPanel } from './DskPanel';

interface ForwardSidebarProps {
  pinps: Record<number, PinPParams>;
  onUpdate: (id: number, updates: Partial<PinPParams>) => void;
  onToggle: (id: number) => void;
  dsk: DskSettings;
  onDskChange: (updates: Partial<DskSettings>) => void;
  dskImageUrl: string | null;
}

const DSK_TAB = 0;

export function ForwardSidebar({ pinps, onUpdate, onToggle, dsk, onDskChange, dskImageUrl }: ForwardSidebarProps) {
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
        <button
          className={`pinp-tab${active === DSK_TAB ? ' active' : ''}`}
          style={{ '--tab-color': 'var(--green)' } as React.CSSProperties}
          onClick={() => setActive(DSK_TAB)}
        >
          <span>DSK</span>
          <button
            className={`pinp-toggle pinp-toggle-sm${dsk.visible ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onDskChange({ visible: !dsk.visible }); }}
          />
        </button>
      </div>
      <div className="pinp-panel">
        {active === DSK_TAB ? (
          <DskPanel dsk={dsk} onChange={onDskChange} imageUrl={dskImageUrl} />
        ) : p.enabled ? (
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
              onChange={(id) => onUpdate(active, { imageId: id ?? 'grid' })}
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

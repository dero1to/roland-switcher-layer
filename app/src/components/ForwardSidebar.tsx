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
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  return (
    <div className="sidebar">
      {[1, 2, 3, 4].map((i) => {
        const p = pinps[i];
        const color = COLORS[i];
        const isCollapsed = collapsed[i] ?? false;
        const showBody = p.enabled && !isCollapsed;

        return (
          <div key={i} className="sidebar-section">
            <div
              className="sidebar-section-header"
              onClick={() => {
                if (p.enabled) setCollapsed(prev => ({ ...prev, [i]: !prev[i] }));
              }}
            >
              <h3>
                <span className="dot" style={{ background: color }} />
                PinP {i}
              </h3>
              <button
                className={`pinp-toggle${p.enabled ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggle(i); }}
              />
            </div>
            {showBody && (
              <div className="sidebar-section-body">
                {PARAMS.map((group) => (
                  <div key={group.group} className="param-group">
                    <div className="param-group-title">{group.group}</div>
                    {group.items.map((item) => (
                      <ParamSlider
                        key={item.key}
                        param={item}
                        value={p[item.key] as number}
                        onChange={(v) => onUpdate(i, { [item.key]: v })}
                      />
                    ))}
                  </div>
                ))}
                <ImageSelector
                  selectedId={p.imageId}
                  onChange={(id) => onUpdate(i, { imageId: id })}
                />
                <CropPreview params={p} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

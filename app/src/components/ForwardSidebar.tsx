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
  active: number;
  onActiveChange: (id: number) => void;
}

const DSK_TAB = 0;

export function ForwardSidebar({ pinps, onUpdate, onToggle, dsk, onDskChange, dskImageUrl, active, onActiveChange }: ForwardSidebarProps) {
  const p = pinps[active];

  return (
    <div className="sidebar">
      <div className="pinp-tabs" role="tablist">
        {[1, 2, 3, 4].map((i) => (
          <Tab
            key={i}
            label={`PinP ${i}`}
            color={COLORS[i]}
            active={active === i}
            enabled={pinps[i].enabled}
            onSelect={() => onActiveChange(i)}
            onToggle={() => onToggle(i)}
          />
        ))}
        <Tab
          label="DSK"
          color="var(--green)"
          active={active === DSK_TAB}
          enabled={dsk.visible}
          onSelect={() => onActiveChange(DSK_TAB)}
          onToggle={() => onDskChange({ visible: !dsk.visible })}
        />
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

/** タブ本体とトグルを兄弟要素にし、button の入れ子を避ける */
function Tab({ label, color, active, enabled, onSelect, onToggle }: {
  label: string;
  color: string;
  active: boolean;
  enabled: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={`pinp-tab${active ? ' active' : ''}`}
      style={{ '--tab-color': color } as React.CSSProperties}
    >
      <button className="pinp-tab-select" role="tab" aria-selected={active} onClick={onSelect}>
        <span className="dot" style={{ background: color }} />
        <span className="pinp-tab-label">{label}</span>
      </button>
      <button
        className={`pinp-toggle pinp-toggle-sm${enabled ? ' active' : ''}`}
        aria-label={`${label} ${enabled ? '無効にする' : '有効にする'}`}
        aria-pressed={enabled}
        onClick={onToggle}
      />
    </div>
  );
}

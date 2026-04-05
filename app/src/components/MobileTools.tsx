import { useState } from 'react';
import type { PixelRect, PresetConfig } from '../types';
import type { SavedSlot } from '../hooks/useSaveSlots';
import { SlotButtons } from './Toolbar';
import { CoordTable } from './BottomBar';
import { ExportButtons } from './ExportButtons';

interface MobileToolsProps {
  presets: PresetConfig[];
  activePreset: number | null;
  onApplyPreset: (idx: number) => void;
  slots: (SavedSlot | null)[];
  onSaveSlot: (idx: number) => void;
  onLoadSlot: (idx: number) => void;
  onDeleteSlot: (idx: number) => void;
  enabledRects: (PixelRect & { id: number })[];
  dskHtml: string;
  onCopyShareUrl: () => void;
  onCopyJson: () => void;
  onCopyText: () => void;
  toastVisible: boolean;
}

export function MobileTools(props: MobileToolsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`mobile-tools${open ? ' open' : ''}`}>
      <button className="mobile-tools-toggle" onClick={() => setOpen(v => !v)}>
        ツール {open ? '▾' : '▸'}
      </button>
      <div className="mobile-tools-body">
        <Section label="プリセット">
          <div className="toolbar-group">
            {props.presets.map((pr, idx) => (
              <button
                key={idx}
                className={`preset-btn${props.activePreset === idx ? ' active' : ''}`}
                title={pr.desc}
                onClick={() => props.onApplyPreset(idx)}
              >
                {pr.name}
              </button>
            ))}
          </div>
        </Section>
        <Section label="保存スロット">
          <SlotButtons slots={props.slots} onSave={props.onSaveSlot} onLoad={props.onLoadSlot} onDelete={props.onDeleteSlot} />
        </Section>
        <Section label="ピクセル座標">
          <CoordTable rects={props.enabledRects} />
        </Section>
        <Section label="DSK設計情報">
          <div className="dsk-info" dangerouslySetInnerHTML={{ __html: props.dskHtml }} />
        </Section>
        <Section label="エクスポート">
          <ExportButtons onShareUrl={props.onCopyShareUrl} onJson={props.onCopyJson} onText={props.onCopyText} toastVisible={props.toastVisible} />
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mobile-tools-section">
      <div className="mobile-tools-label">{label}</div>
      {children}
    </div>
  );
}

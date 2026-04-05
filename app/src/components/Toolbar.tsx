import type { PresetConfig } from '../types';
import type { SavedSlot } from '../hooks/useSaveSlots';

interface ToolbarProps {
  presets: PresetConfig[];
  activePreset: number | null;
  onApplyPreset: (idx: number) => void;
  slots: (SavedSlot | null)[];
  onSaveSlot: (idx: number) => void;
  onLoadSlot: (idx: number) => void;
  onDeleteSlot: (idx: number) => void;
}

export function Toolbar({ presets, activePreset, onApplyPreset, slots, onSaveSlot, onLoadSlot, onDeleteSlot }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        {presets.map((pr, idx) => (
          <button
            key={idx}
            className={`preset-btn${activePreset === idx ? ' active' : ''}`}
            title={pr.desc}
            onClick={() => onApplyPreset(idx)}
          >
            {pr.name}
          </button>
        ))}
      </div>
      <div className="toolbar-sep" />
      <SlotButtons slots={slots} onSave={onSaveSlot} onLoad={onLoadSlot} onDelete={onDeleteSlot} />
    </div>
  );
}

export function SlotButtons({ slots, onSave, onLoad, onDelete }: {
  slots: (SavedSlot | null)[];
  onSave: (idx: number) => void;
  onLoad: (idx: number) => void;
  onDelete: (idx: number) => void;
}) {
  return (
    <div className="toolbar-group">
      {slots.map((slot, idx) => (
        <div key={idx} className="save-slot">
          {slot ? (
            <>
              <button className="slot-load" onClick={() => onLoad(idx)} title="読み込む">{slot.name}</button>
              <button className="slot-overwrite" onClick={() => onSave(idx)} title="上書き保存">↻</button>
              <button className="slot-delete" onClick={() => onDelete(idx)} title="削除">×</button>
            </>
          ) : (
            <button className="slot-empty" onClick={() => onSave(idx)}>{idx + 1}</button>
          )}
        </div>
      ))}
    </div>
  );
}

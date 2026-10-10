import { useState, useEffect } from 'react';
import type { PresetConfig } from '../types';
import type { SavedSlot } from '../hooks/useSaveSlots';

interface ToolbarProps {
  presets: PresetConfig[];
  activePreset: number | null;
  onApplyPreset: (idx: number) => void;
  slots: (SavedSlot | null)[];
  onSaveSlot: (idx: number) => void;
  onRenameSlot: (idx: number, name: string) => void;
  onLoadSlot: (idx: number) => void;
  onDeleteSlot: (idx: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({ presets, activePreset, onApplyPreset, slots, onSaveSlot, onRenameSlot, onLoadSlot, onDeleteSlot, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
  return (
    <div className="toolbar">
      <HistoryButtons onUndo={onUndo} onRedo={onRedo} canUndo={canUndo} canRedo={canRedo} />
      <div className="toolbar-sep" />
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
      <SlotButtons slots={slots} onSave={onSaveSlot} onRename={onRenameSlot} onLoad={onLoadSlot} onDelete={onDeleteSlot} />
    </div>
  );
}

export function HistoryButtons({ onUndo, onRedo, canUndo, canRedo }: {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <div className="toolbar-group">
      <button className="history-btn" onClick={onUndo} disabled={!canUndo} title="元に戻す（Ctrl+Z）" aria-label="元に戻す">↶</button>
      <button className="history-btn" onClick={onRedo} disabled={!canRedo} title="やり直す（Ctrl+Shift+Z）" aria-label="やり直す">↷</button>
    </div>
  );
}

export function SlotButtons({ slots, onSave, onRename, onLoad, onDelete }: {
  slots: (SavedSlot | null)[];
  onSave: (idx: number) => void;
  onRename: (idx: number, name: string) => void;
  onLoad: (idx: number) => void;
  onDelete: (idx: number) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  /** 上書き・削除は2回押しで確定（誤操作防止） */
  const [confirm, setConfirm] = useState<{ idx: number; action: 'overwrite' | 'delete' } | null>(null);

  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(null), 3000);
    return () => clearTimeout(t);
  }, [confirm]);

  const confirmOr = (idx: number, action: 'overwrite' | 'delete', run: () => void) => {
    if (confirm?.idx === idx && confirm.action === action) {
      setConfirm(null);
      run();
    } else {
      setConfirm({ idx, action });
    }
  };

  return (
    <div className="toolbar-group">
      {slots.map((slot, idx) => {
        const pending = confirm?.idx === idx ? confirm.action : null;
        return (
          <div key={idx} className="save-slot">
            {slot ? (
              <>
                {editing === idx ? (
                  <input
                    className="slot-name-input"
                    defaultValue={slot.name}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    onBlur={(e) => { onRename(idx, e.target.value); setEditing(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                      if (e.key === 'Escape') setEditing(null);
                    }}
                  />
                ) : (
                  <button
                    className="slot-load"
                    onClick={() => onLoad(idx)}
                    onDoubleClick={() => setEditing(idx)}
                    title="クリックで読み込み / ダブルクリックで名前を変更"
                  >
                    {slot.name}
                  </button>
                )}
                <button
                  className={`slot-overwrite${pending === 'overwrite' ? ' confirm' : ''}`}
                  onClick={() => confirmOr(idx, 'overwrite', () => onSave(idx))}
                  title="現在のレイアウトで上書き"
                >
                  {pending === 'overwrite' ? '上書き?' : '↻'}
                </button>
                <button
                  className={`slot-delete${pending === 'delete' ? ' confirm' : ''}`}
                  onClick={() => confirmOr(idx, 'delete', () => onDelete(idx))}
                  title="削除"
                >
                  {pending === 'delete' ? '削除?' : '×'}
                </button>
              </>
            ) : (
              <button
                className="slot-empty"
                onClick={() => { onSave(idx); setEditing(idx); }}
                title={`スロット${idx + 1}に現在のレイアウトを保存`}
              >
                ＋ 保存{idx + 1}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

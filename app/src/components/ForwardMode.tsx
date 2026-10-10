import { useState, useCallback, useMemo, useEffect } from 'react';
import type { PinPParams, PixelRect } from '../types';
import { PRESETS } from '../utils/constants';
import { calcRect, calcSourceView, detectOverlaps, buildDskInfo, buildForwardExportJson, buildForwardExportText } from '../utils/calc';
import { useDragHandlers } from '../hooks/useDragHandlers';
import { useSaveSlots } from '../hooks/useSaveSlots';
import { useHistory } from '../hooks/useHistory';
import { useToast } from '../hooks/useToast';
import { useDsk, useDskImageUrl } from '../hooks/useDsk';
import { useImages } from '../contexts/imageContext';
import { buildGuidePng, downloadBlob } from '../utils/guideImage';
import type { DskSettings } from '../types';
import { ForwardSidebar } from './ForwardSidebar';
import { Monitor } from './Monitor';
import { Toolbar } from './Toolbar';
import { BottomBar } from './BottomBar';
import { MobileTools } from './MobileTools';

interface ForwardModeProps {
  pinps: Record<number, PinPParams>;
  setPinps: React.Dispatch<React.SetStateAction<Record<number, PinPParams>>>;
}

export function ForwardMode({ pinps, setPinps }: ForwardModeProps) {
  const [activePreset, setActivePreset] = useState<number | null>(null);
  /** 編集対象（1〜4: PinP / 0: DSK）。モニタとサイドバーで共有 */
  const [selected, setSelected] = useState(1);
  const toast = useToast();
  const showToast = toast.show;
  const { resolveUrl } = useImages();
  const [dsk, setDsk] = useDsk();
  const dskImageUrl = useDskImageUrl(dsk);
  const handleDskChange = useCallback((updates: Partial<DskSettings>) => {
    setDsk(prev => ({ ...prev, ...updates }));
  }, [setDsk]);
  const { slots, saveSlot, renameSlot, loadSlot, deleteSlot } = useSaveSlots(pinps, setPinps);

  const clearPreset = useCallback(() => setActivePreset(null), []);
  const dragHandlers = useDragHandlers(pinps, setPinps, clearPreset);
  const { endDrag } = dragHandlers;
  const { undo, redo, commit, canUndo, canRedo } = useHistory(pinps, setPinps);
  const handleDragEnd = useCallback(() => {
    endDrag();
    // pointerup 直後の state 反映を待ってから確定
    setTimeout(commit, 0);
  }, [endDrag, commit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      // 入力欄ではブラウザ標準の Undo を優先
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); setActivePreset(null); }
      else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redo(); setActivePreset(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const handleUpdate = useCallback((id: number, updates: Partial<PinPParams>) => {
    setPinps(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }));
    setActivePreset(null);
  }, [setPinps]);

  const handleToggle = useCallback((id: number) => {
    setPinps(prev => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }));
    setActivePreset(null);
  }, [setPinps]);

  const applyPreset = useCallback((idx: number) => {
    const pr = PRESETS[idx];
    setPinps(prev => {
      const next = { ...prev };
      for (let i = 1; i <= 4; i++) {
        next[i] = { ...JSON.parse(JSON.stringify(pr.config[i])), imageId: prev[i].imageId };
      }
      return next;
    });
    setActivePreset(idx);
  }, [setPinps]);

  const handleLoadSlot = useCallback((idx: number) => {
    loadSlot(idx);
    setActivePreset(null);
  }, [loadSlot]);

  const copyShareUrl = useCallback(() => {
    navigator.clipboard.writeText(location.href).then(() => showToast());
  }, [showToast]);

  const copyJson = useCallback(() => {
    navigator.clipboard.writeText(buildForwardExportJson(pinps)).then(() => showToast());
  }, [pinps, showToast]);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(buildForwardExportText(pinps)).then(() => showToast());
  }, [pinps, showToast]);

  const enabledRects = useMemo(() => {
    const rects: (PixelRect & { id: number })[] = [];
    for (let i = 1; i <= 4; i++) {
      if (pinps[i].enabled) rects.push({ id: i, ...calcRect(pinps[i]) });
    }
    return rects;
  }, [pinps]);

  const downloadGuidePng = useCallback(() => {
    buildGuidePng(enabledRects)
      .then(blob => {
        downloadBlob(blob, 'v160hd-dsk-guide.png');
        showToast('PNGを保存しました');
      })
      .catch(() => showToast('PNGの生成に失敗しました'));
  }, [enabledRects, showToast]);

  const overlaps = useMemo(() => detectOverlaps(enabledRects), [enabledRects]);
  const dskHtml = useMemo(() => buildDskInfo(enabledRects, overlaps), [enabledRects, overlaps]);

  const sharedProps = {
    presets: PRESETS,
    activePreset,
    onApplyPreset: applyPreset,
    slots,
    onSaveSlot: saveSlot,
    onRenameSlot: renameSlot,
    onLoadSlot: handleLoadSlot,
    onDeleteSlot: deleteSlot,
    enabledRects,
    dskHtml,
    onGuidePng: downloadGuidePng,
    onCopyShareUrl: copyShareUrl,
    onCopyJson: copyJson,
    onCopyText: copyText,
    onUndo: () => { undo(); setActivePreset(null); },
    onRedo: () => { redo(); setActivePreset(null); },
    canUndo,
    canRedo,
    toastVisible: toast.visible,
    toastMessage: toast.message,
  };

  return (
    <>
      <div className="main">
        <Toolbar {...sharedProps} />
        <div className="monitor-wrap">
          <Monitor
            rects={enabledRects.map(r => ({
              id: r.id,
              rect: r,
              imageUrl: resolveUrl(pinps[r.id].imageId),
              sourceView: calcSourceView(pinps[r.id]),
            }))}
            dsk={dsk.visible && dskImageUrl ? { url: dskImageUrl, level: dsk.level } : null}
            selectedId={selected}
            onSelect={setSelected}
            onRectDrag={dragHandlers.handleRectDrag}
            onDragStart={commit}
            onDragEnd={handleDragEnd}
            guides={dragHandlers.guides}
            onZoomDrag={dragHandlers.handleZoomDrag}
            onImgZoomDrag={dragHandlers.handleImgZoomDrag}
            onCropHDrag={dragHandlers.handleCropHDrag}
            onCropVDrag={dragHandlers.handleCropVDrag}
          />
        </div>
        <BottomBar {...sharedProps} />
        <MobileTools {...sharedProps} />
      </div>
      <ForwardSidebar
        pinps={pinps}
        onUpdate={handleUpdate}
        onToggle={handleToggle}
        dsk={dsk}
        onDskChange={handleDskChange}
        dskImageUrl={dskImageUrl}
        active={selected}
        onActiveChange={setSelected}
      />
    </>
  );
}

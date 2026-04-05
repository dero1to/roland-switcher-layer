import { useState, useCallback, useMemo } from 'react';
import type { PinPParams, PixelRect } from '../types';
import { PRESETS } from '../utils/constants';
import { calcRect, detectOverlaps, buildDskInfo, buildForwardExportJson, buildForwardExportText } from '../utils/calc';
import { useDragHandlers } from '../hooks/useDragHandlers';
import { useSaveSlots } from '../hooks/useSaveSlots';
import { useToast } from '../hooks/useToast';
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
  const toast = useToast();
  const { slots, saveSlot, loadSlot, deleteSlot } = useSaveSlots(pinps, setPinps);

  const clearPreset = useCallback(() => setActivePreset(null), []);
  const dragHandlers = useDragHandlers(setPinps, clearPreset);

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
    navigator.clipboard.writeText(location.href).then(toast.show);
  }, [toast.show]);

  const copyJson = useCallback(() => {
    navigator.clipboard.writeText(buildForwardExportJson(pinps)).then(toast.show);
  }, [pinps, toast.show]);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(buildForwardExportText(pinps)).then(toast.show);
  }, [pinps, toast.show]);

  const enabledRects = useMemo(() => {
    const rects: (PixelRect & { id: number })[] = [];
    for (let i = 1; i <= 4; i++) {
      if (pinps[i].enabled) rects.push({ id: i, ...calcRect(pinps[i]) });
    }
    return rects;
  }, [pinps]);

  const overlaps = useMemo(() => detectOverlaps(enabledRects), [enabledRects]);
  const dskHtml = useMemo(() => buildDskInfo(enabledRects, overlaps), [enabledRects, overlaps]);

  const sharedProps = {
    presets: PRESETS,
    activePreset,
    onApplyPreset: applyPreset,
    slots,
    onSaveSlot: saveSlot,
    onLoadSlot: handleLoadSlot,
    onDeleteSlot: deleteSlot,
    enabledRects,
    dskHtml,
    onCopyShareUrl: copyShareUrl,
    onCopyJson: copyJson,
    onCopyText: copyText,
    toastVisible: toast.visible,
  };

  return (
    <>
      <div className="main">
        <Toolbar {...sharedProps} />
        <div className="monitor-wrap">
          <Monitor
            rects={enabledRects.map(r => ({ id: r.id, rect: r }))}
            onRectDrag={dragHandlers.handleRectDrag}
            onZoomDrag={dragHandlers.handleZoomDrag}
            onImgZoomDrag={dragHandlers.handleImgZoomDrag}
            onCropHDrag={dragHandlers.handleCropHDrag}
            onCropVDrag={dragHandlers.handleCropVDrag}
          />
        </div>
        <BottomBar {...sharedProps} />
        <MobileTools {...sharedProps} />
      </div>
      <ForwardSidebar pinps={pinps} onUpdate={handleUpdate} onToggle={handleToggle} />
    </>
  );
}

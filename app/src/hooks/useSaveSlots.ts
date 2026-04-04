import { useState, useEffect, useCallback } from 'react';
import type { PinPParams } from '../types';

const STORAGE_KEY = 'v160hd-saved-slots';

export interface SavedSlot {
  name: string;
  pinps: Record<number, PinPParams>;
}

function load(): (SavedSlot | null)[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [null, null, null, null, null];
}

export function useSaveSlots(pinps: Record<number, PinPParams>, setPinps: React.Dispatch<React.SetStateAction<Record<number, PinPParams>>>) {
  const [slots, setSlots] = useState<(SavedSlot | null)[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  }, [slots]);

  const saveSlot = useCallback((idx: number) => {
    const name = prompt('保存名を入力', slots[idx]?.name || `保存${idx + 1}`);
    if (name === null) return;
    setSlots(prev => {
      const next = [...prev];
      next[idx] = { name: name || `保存${idx + 1}`, pinps: JSON.parse(JSON.stringify(pinps)) };
      return next;
    });
  }, [pinps, slots]);

  const loadSlot = useCallback((idx: number) => {
    const slot = slots[idx];
    if (slot) setPinps(slot.pinps);
  }, [slots, setPinps]);

  const deleteSlot = useCallback((idx: number) => {
    setSlots(prev => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  }, []);

  return { slots, saveSlot, loadSlot, deleteSlot };
}

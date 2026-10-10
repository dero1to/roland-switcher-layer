import { useRef, useState, useEffect, useCallback } from 'react';

const LIMIT = 100;

/**
 * 値の変更履歴（Undo/Redo）。連続した変更（ドラッグ・スライダー）は
 * idleMs 操作が止まった時点で1手としてまとめる
 */
export function useHistory<T>(value: T, setValue: (v: T) => void, idleMs = 400) {
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const committed = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [counts, setCounts] = useState({ undo: 0, redo: 0 });

  const sync = useCallback(() => setCounts({ undo: past.current.length, redo: future.current.length }), []);

  /** 未確定の変更を履歴に積む */
  const flush = useCallback((current: T) => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (current === committed.current) return;
    past.current = [...past.current, committed.current].slice(-LIMIT);
    future.current = [];
    committed.current = current;
    sync();
  }, [sync]);

  useEffect(() => {
    if (value === committed.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flush(value), idleMs);
  }, [value, idleMs, flush]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const undo = useCallback(() => {
    flush(valueRef.current);
    const prev = past.current.at(-1);
    if (prev === undefined) return;
    past.current = past.current.slice(0, -1);
    future.current = [...future.current, committed.current];
    committed.current = prev;
    setValue(prev);
    sync();
  }, [flush, setValue, sync]);

  const redo = useCallback(() => {
    flush(valueRef.current);
    const next = future.current.at(-1);
    if (next === undefined) return;
    future.current = future.current.slice(0, -1);
    past.current = [...past.current, committed.current];
    committed.current = next;
    setValue(next);
    sync();
  }, [flush, setValue, sync]);

  /** 操作の区切り（ドラッグ終了など）で即座に1手として確定する */
  const commit = useCallback(() => flush(valueRef.current), [flush]);

  return { undo, redo, commit, canUndo: counts.undo > 0, canRedo: counts.redo > 0 };
}

import { useState, useEffect } from 'react';
import type { DskSettings } from '../types';
import { useImages } from '../contexts/imageContext';
import { compositeFillKey } from '../utils/keyComposite';

const STORAGE_KEY = 'v160hd-dsk';

const DEFAULT_DSK: DskSettings = {
  visible: true,
  mode: 'alpha',
  fillId: null,
  keyId: null,
  keyInvert: false,
  level: 100,
};

function load(): DskSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_DSK, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_DSK;
}

export function useDsk() {
  const [dsk, setDsk] = useState<DskSettings>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dsk));
  }, [dsk]);

  return [dsk, setDsk] as const;
}

/** モニターに重ねる DSK 画像の URL（Fill/Key モードは合成結果） */
export function useDskImageUrl(dsk: DskSettings): string | null {
  const { resolveUrl } = useImages();
  const fillUrl = resolveUrl(dsk.fillId);
  const keyUrl = resolveUrl(dsk.keyId);
  const needsComposite = dsk.mode === 'fillKey' && !!fillUrl && !!keyUrl;
  const [composite, setComposite] = useState<{ src: string; url: string } | null>(null);
  const src = needsComposite ? `${fillUrl}|${keyUrl}|${dsk.keyInvert}` : '';

  useEffect(() => {
    if (!needsComposite) return;
    let cancelled = false;
    let created: string | null = null;
    compositeFillKey(fillUrl!, keyUrl!, dsk.keyInvert)
      .then(url => {
        created = url;
        if (cancelled) URL.revokeObjectURL(url);
        else setComposite({ src, url });
      })
      .catch(() => { if (!cancelled) setComposite(null); });
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [needsComposite, fillUrl, keyUrl, dsk.keyInvert, src]);

  if (dsk.mode === 'alpha') return fillUrl;
  if (!fillUrl) return null;
  // Key 未指定なら Fill をそのまま全面表示（不透明）
  if (!keyUrl) return fillUrl;
  return composite?.src === src ? composite.url : null;
}

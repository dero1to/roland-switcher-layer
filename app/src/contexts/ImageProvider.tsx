import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageContext, type UserImage } from './imageContext';
import { listImages, putImage, deleteImage } from '../utils/imageStore';

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    listImages()
      .then(items => {
        if (cancelled) return;
        const imgs = items
          .sort((a, b) => a.createdAt - b.createdAt)
          .map(it => ({ id: it.id, name: it.name, url: URL.createObjectURL(it.blob) }));
        urlsRef.current.push(...imgs.map(i => i.url));
        setUserImages(prev => [...imgs, ...prev]);
      })
      .catch(() => { /* IndexedDB 非対応環境ではセッション内のみ保持 */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => urlsRef.current.forEach(u => URL.revokeObjectURL(u)), []);

  const addImages = useCallback(async (files: FileList | File[]) => {
    const added: UserImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const id = `up:${crypto.randomUUID()}`;
      await putImage({ id, name: file.name, blob: file, createdAt: Date.now() }).catch(() => {});
      const url = URL.createObjectURL(file);
      urlsRef.current.push(url);
      added.push({ id, name: file.name, url });
    }
    setUserImages(prev => [...prev, ...added]);
    return added.map(a => a.id);
  }, []);

  const removeImage = useCallback((id: string) => {
    deleteImage(id).catch(() => {});
    setUserImages(prev => prev.filter(img => img.id !== id));
  }, []);

  return (
    <ImageContext.Provider value={{ userImages, addImages, removeImage }}>
      {children}
    </ImageContext.Provider>
  );
}

// アップロード画像を IndexedDB に保存する（localStorage では容量が足りないため）
const DB_NAME = 'v160hd-images';
const STORE = 'images';

export interface StoredImage {
  id: string;
  name: string;
  blob: Blob;
  createdAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function listImages(): Promise<StoredImage[]> {
  return tx('readonly', s => s.getAll() as IDBRequest<StoredImage[]>);
}

export function putImage(img: StoredImage): Promise<IDBValidKey> {
  return tx('readwrite', s => s.put(img));
}

export function deleteImage(id: string): Promise<undefined> {
  return tx('readwrite', s => s.delete(id));
}

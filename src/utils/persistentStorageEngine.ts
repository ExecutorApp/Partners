import { Platform } from 'react-native';

export function getLocalStorage(): Storage | null {
  if (Platform.OS !== 'web') return null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Ignora
  }
  return null;
}

export function canUseIndexedDB(): boolean {
  return Platform.OS === 'web' && typeof indexedDB !== 'undefined';
}

function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open('partners.registration', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e as any);
    }
  });
}

export async function idbGet(key: string): Promise<string | null> {
  if (!canUseIndexedDB()) return null;
  try {
    const db = await idbOpen();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction('kv', 'readonly');
      const store = tx.objectStore('kv');
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as string) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function idbSet(key: string, value: string): Promise<void> {
  if (!canUseIndexedDB()) return;
  try {
    const db = await idbOpen();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('kv', 'readwrite');
      const store = tx.objectStore('kv');
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // silencia erro
  }
}

export async function idbRemove(key: string): Promise<void> {
  if (!canUseIndexedDB()) return;
  try {
    const db = await idbOpen();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('kv', 'readwrite');
      const store = tx.objectStore('kv');
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // silencia erro
  }
}
import { Platform } from 'react-native';

export type PersonalInfo = {
  fullName: string;
  whatsapp: string;
  email?: string;
};

export type LocationData = {
  state: string;
  city: string;
};

const KEY = 'partners.personalInfo';
const LOCATION_KEY = 'partners.location';

// Simple in-memory fallback for non-web platforms (when localStorage/sessionStorage are not available)
const memoryStore: Record<string, string> = {};

function getWebStorage(): Storage | null {
  if (Platform.OS !== 'web') return null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch {
    // Ignore and fall back to memory store
  }
  return null;
}

export function savePersonalInfo(fullName: string, whatsapp: string): void {
  const storage = getWebStorage();
  const payload = JSON.stringify({ fullName, whatsapp });
  try {
    if (storage) {
      storage.setItem(KEY, payload);
    } else {
      memoryStore[KEY] = payload;
    }
  } catch {
    memoryStore[KEY] = payload;
  }
}

export function getPersonalInfo(): PersonalInfo | null {
  const storage = getWebStorage();
  try {
    const raw = storage ? storage.getItem(KEY) : memoryStore[KEY];
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersonalInfo;
    if (!parsed || typeof parsed.fullName !== 'string' || typeof parsed.whatsapp !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveEmail(email: string): void {
  const storage = getWebStorage();
  const currentInfo = getPersonalInfo();
  const payload = JSON.stringify({ 
    fullName: currentInfo?.fullName || '', 
    whatsapp: currentInfo?.whatsapp || '',
    email 
  });
  try {
    if (storage) {
      storage.setItem(KEY, payload);
    } else {
      memoryStore[KEY] = payload;
    }
  } catch {
    memoryStore[KEY] = payload;
  }
}

export function clearPersonalInfo(): void {
  const storage = getWebStorage();
  try {
    if (storage) {
      storage.removeItem(KEY);
    }
    delete memoryStore[KEY];
  } catch {
    delete memoryStore[KEY];
  }
}

// Location persistence helpers
export function saveLocation(state: string, city: string): void {
  const storage = getWebStorage();
  const payload = JSON.stringify({ state, city });
  try {
    if (storage) {
      storage.setItem(LOCATION_KEY, payload);
    } else {
      memoryStore[LOCATION_KEY] = payload;
    }
  } catch {
    memoryStore[LOCATION_KEY] = payload;
  }
}

export function getLocation(): LocationData | null {
  const storage = getWebStorage();
  try {
    const raw = storage ? storage.getItem(LOCATION_KEY) : memoryStore[LOCATION_KEY];
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocationData;
    if (!parsed || typeof parsed.state !== 'string' || typeof parsed.city !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLocation(): void {
  const storage = getWebStorage();
  try {
    if (storage) {
      storage.removeItem(LOCATION_KEY);
    }
    delete memoryStore[LOCATION_KEY];
  } catch {
    delete memoryStore[LOCATION_KEY];
  }
}
export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  getString(key: string): string {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(key) || '';
  },
  set(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

export const STORAGE_KEYS = {
  authUser: 'authUser',
  userDetails: 'userDetails',
  isB2b: 'isB2b',
};

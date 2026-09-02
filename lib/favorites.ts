// External store for favorites, persisted to localStorage so a saved property
// survives a reload — this previously lived only in a module-scoped array.
const STORAGE_KEY = "el-moore-favorites";

let favorites: string[] = [];
let hydrated = false;
const listeners: Set<() => void> = new Set();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    favorites = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    favorites = [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

export const getFavorites = () => {
  hydrate();
  return favorites;
};

export const toggleFavorite = (id: string) => {
  hydrate();
  favorites = favorites.includes(id)
    ? favorites.filter((f) => f !== id)
    : [...favorites, id];
  persist();
  listeners.forEach((l) => l());
};

export const isFavorite = (id: string) => {
  hydrate();
  return favorites.includes(id);
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

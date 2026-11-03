// Μικρό wrapper για το localStorage. Αν ο browser το μπλοκάρει (private mode κ.λπ.)
// η εφαρμογή συνεχίζει κανονικά χωρίς αποθήκευση.
const PREFIX = 'gem.';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* χωρίς αποθήκευση */
  }
}

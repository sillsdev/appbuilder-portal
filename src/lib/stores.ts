import { type Writable, get, writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * A Svelte store that persists its value in localStorage.
 *
 * @param key The localStorage key
 * @param initial Initial value to use if nothing is stored
 */
export function persistedLocal<T>(key: string, initial: T): Writable<T> {
  // Start with initial value (safe for SSR)
  const start = writable(initial);

  if (browser) {
    // If there’s already something stored, load it
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        console.log('Loaded from localStorage:', JSON.parse(stored));
        start.set(JSON.parse(stored));
      } catch {
        console.error('Failed to parse stored value for key ', key, ' using ', initial);
        // if parsing fails, fall back to initial
        start.set(initial);
      }
    }

    // Keep localStorage in sync
    start.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return start;
}

/**
 * A Svelte store that persists its value in sessionStorage (unique to each tab)
 *
 * @param key The sessionStorage key
 * @param initial Initial value to use if nothing is stored
 */
export function persistedSession<T>(key: string, initial: T): Writable<T> {
  // Start with initial value (safe for SSR)
  const start = writable(initial);

  if (browser) {
    // If there’s already something stored, load it
    const stored = sessionStorage.getItem(key);
    if (stored !== null) {
      try {
        start.set(JSON.parse(stored));
      } catch {
        // if parsing fails, fall back to initial
        start.set(initial);
      }
    }

    // Keep sessionStorage in sync
    start.subscribe((value) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    });
  }

  return start;
}

export const orgLastSelected = persistedLocal('orgLastSelected', 0);
export const orgActive = persistedSession('orgActive', get(orgLastSelected));
orgActive.subscribe((value) => {
  orgLastSelected.set(value);
});

// Set cookie whenever orgLastSelected changes (client-side only)
if (browser) {
  orgLastSelected.subscribe((value) => {
    document.cookie = `orgLastSelected=${value}; path=/; SameSite=Lax`;
  });
}

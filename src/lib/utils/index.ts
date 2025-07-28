import { toast } from '@zerodevx/svelte-toast';

export function sanitizeInput(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
export function bytesToHumanSize(bytes: bigint | null) {
  if (bytes === null) {
    return '--';
  }
  const base = BigInt('1024');
  if (bytes > base ** BigInt(3)) {
    return bytes / base ** BigInt(3) + ' GB';
  } else if (bytes > base * base) {
    return bytes / (base * base) + ' MB';
  } else if (bytes > base) {
    return bytes / base + ' KB';
  } else {
    return bytes + ' bytes';
  }
}

export type Entries<K, V> = [K, V][];

export type ValidKey<T extends object> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => void ? K : never;
}[keyof T];

/**
 * Utility function to get just the numeric values of an enum, because of how enums are implemented in TS
 *
 * Using Record for type because TS currently does not support `extends enum` https://github.com/microsoft/TypeScript/issues/30611
 *
 * @param e any enum
 * @returns the numeric values of the enum
 */
export function enumNumVals<E extends Record<string, string | number>>(e: E): number[] {
  return Object.values(e).filter((v) => !(typeof v === 'string'));
}

export enum ServerStatus {
  Ok = 200,
  Forbidden = 403,
  NotFound = 404
}

function pushToast(type: 'info' | 'success' | 'warning' | 'error', message: string) {
  toast.push(message, { pausable: true, classes: [type] });
}
export { pushToast as toast };

export type ValueFilter<T> =
  | { is: T } // T is the provided
  | { any: Set<T> } // T is any of the provided
  | { not: T } // T is not the provided
  | { none: Set<T> }; // T is none of the provided

export type SetFilter<T> =
  | { has: T } // Set<T> contains the provided
  | { any: Set<T> } // Set<T> contains any of the provided
  | { all: Set<T> } // Set<T> contains all of the provided
  | { none: Set<T> }; // Set<T> contains none of the provided

export function filterValue<T>(value: T, filter: ValueFilter<T>) {
  if ('is' in filter) {
    return value === filter.is;
  } else if ('any' in filter) {
    return filter.any.has(value);
  } else if ('not' in filter) {
    return value !== filter.not;
  } else {
    return !filter.none.has(value);
  }
}

export function filterSet<T>(values: Set<T>, filter: SetFilter<T>) {
  if ('has' in filter) {
    return values.has(filter.has);
  } else if ('any' in filter) {
    return !values.isDisjointFrom(filter.any);
  } else if ('all' in filter) {
    return values.isSupersetOf(filter.all);
  } else {
    return values.isDisjointFrom(filter.none);
  }
}

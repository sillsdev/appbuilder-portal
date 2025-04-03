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

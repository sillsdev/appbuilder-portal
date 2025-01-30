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

interface NamedEntity {
  Name: string | null;
}

export function sortByName(a: NamedEntity, b: NamedEntity, languageTag: string): number {
  return a.Name?.localeCompare(b.Name ?? '', languageTag) ?? 0;
}

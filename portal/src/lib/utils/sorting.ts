interface NamedEntity {
  Name: string | null | undefined;
}

export function byName(
  a: NamedEntity | null | undefined,
  b: NamedEntity | null | undefined,
  languageTag: string
): number {
  return byString(a?.Name, b?.Name, languageTag);
}

export function byString(
  a: string | null | undefined,
  b: string | null | undefined,
  languageTag: string
): number {
  return a?.localeCompare(b ?? '', languageTag) ?? 0;
}

export function byNumber(a: number | bigint | null, b: number | bigint | null): number {
  return a === b ? 0 : (a ?? 0) > (b ?? 0) ? 1 : -1;
}

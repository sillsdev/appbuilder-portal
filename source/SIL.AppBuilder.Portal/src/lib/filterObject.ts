//source: https://www.steveruiz.me/posts/how-to-filter-an-object

type Entry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T]

export function filterObject<T extends object>(
  obj: T,
  fn: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean
) {
  return Object.fromEntries(
    (Object.entries(obj) as Entry<T>[]).filter(fn)
  ) as Partial<T>
}
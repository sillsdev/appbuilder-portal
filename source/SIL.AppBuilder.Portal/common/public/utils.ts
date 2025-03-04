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

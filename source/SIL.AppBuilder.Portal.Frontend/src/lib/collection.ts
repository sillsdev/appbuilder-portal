export function isEmpty(data) {
  return (
    !data
      || (Array.isArray(data) && data.length === 0)
      || (typeof(data) === 'string' && data.length === 0)
  );
}

export function unique(arr) {
  return Array.from(new Set(arr));
}


export const applyNumberOfTimes = (x, f) => {
  const result: any[] = [];

  for (let i = 0; i < x; i++) {
    result.push(f(i));
  }

  return result;
};

export function compareVia(accessor: any) {
  return (a,b) => {
    const aV = accessor(a);
    const bV = accessor(b);

    if (aV < bV) { return -1; }
    if (aV > bV) { return 1; }
    return 0;
  };
}

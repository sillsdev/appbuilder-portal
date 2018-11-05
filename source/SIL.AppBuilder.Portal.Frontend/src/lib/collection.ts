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

const comparatorInverted = (v) => {
  if (v === 1) { return -1; }
  if (v === -1) { return 1; }

  return v;
};

export function compareVia(accessor: any, invert?: boolean) {
  const inverter = invert ? comparatorInverted : v => v;

  return (a,b) => {
    const aV = accessor(a);
    const bV = accessor(b);

    if (aV < bV) { return inverter(-1); }
    if (aV > bV) { return inverter(1); }
    return 0;
  };
}

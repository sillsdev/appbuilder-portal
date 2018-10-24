export function isEmpty(data) {
  return (
    !data
      || (Array.isArray(data) && data.length === 0)
      || (typeof(data) === 'string' && data.length === 0)
  );
}


export const applyNumberOfTimes = (x, f) => {
  const result: any[] = [];

  for (let i = 0; i < x; i++) {
    result.push(f(i));
  }

  return result;
};

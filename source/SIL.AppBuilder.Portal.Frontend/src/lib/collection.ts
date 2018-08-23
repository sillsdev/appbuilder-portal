export function isEmpty(data) {
  return (
    !data
      || (Array.isArray(data) && data.length === 0)
      || (typeof(data) === 'string' && data.length === 0)
  );
}

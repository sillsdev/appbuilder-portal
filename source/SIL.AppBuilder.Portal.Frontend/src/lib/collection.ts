export function isEmpty(data) {
  return (!data || (Array.isArray(data) && data.length === 0));
}

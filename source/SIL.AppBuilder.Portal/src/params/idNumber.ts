export function match(param: string) {
  const val = parseInt(param);
  return '' + val === param && !isNaN(val) && val > 0;
}

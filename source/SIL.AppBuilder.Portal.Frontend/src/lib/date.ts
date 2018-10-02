export function tomorrow() {
  const d = new Date();

  d.setDate(d.getDate() + 1);

  return d;
}

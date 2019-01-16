export function isValidEmail(data) {
  const emailRegex = /^(.+)@(.+)\.(.+)/;

  return !data || emailRegex.test(data);
}

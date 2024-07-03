export function match(param: string) {
  return ['all', 'own', 'organization', 'active', 'archived'].includes(param);
}

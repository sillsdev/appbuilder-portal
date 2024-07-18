export function match(param: string) {
  return ['organization', 'archived', 'active', 'all', 'own'].includes(param);
}

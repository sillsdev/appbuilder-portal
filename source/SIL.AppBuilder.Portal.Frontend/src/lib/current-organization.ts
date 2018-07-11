const storageKey = 'currentOrganizationId';

export function getCurrentOrganizationId(): string {
  return localStorage.getItem(storageKey);
}

export function setCurrentOrganizationId(id: string) {
  localStorage.setItem(storageKey, id);
}

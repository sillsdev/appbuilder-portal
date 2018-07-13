import { getToken } from './auth0';
import { getCurrentOrganizationId } from './current-organization';

export function get(url: string, options: any = {}) {
  return authenticatedFetch(url, { method: 'GET', ...options });
}

export function put(url: string, data: any, options: any = {}) {
  return authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
}

export function post(url: string, data: any, options: any = {}) {
  return authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
}

export function destroy(url: string, options: any = {}) {
  return authenticatedFetch(url, { method: 'DELETE', ...options });
}

export function authenticatedFetch(url: string, options: any) {
  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders(),
      ...options.headers
    }
  });
}

export function defaultHeaders() {
  const token = getToken();
  const orgId = getCurrentOrganizationId();
  
  return {
    ['Authorization']: `Bearer ${token}`,
    ['Organization']: `${orgId}`,
  }
}
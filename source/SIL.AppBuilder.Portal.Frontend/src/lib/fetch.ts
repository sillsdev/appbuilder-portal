import { getToken } from './auth0';

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
  const token = getToken();

  return fetch(url, {
    ...options,
    headers: {
      ['Authorization']: `Bearer ${token}`,
      ...options.headers
    }
  });
}

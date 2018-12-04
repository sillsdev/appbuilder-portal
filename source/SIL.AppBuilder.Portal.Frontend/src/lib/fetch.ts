import { getToken } from './auth0';
import { getCurrentOrganizationId } from './current-organization';
import { isTesting } from '@env';

export const tryParseJson = async (response) => {
  const text = await response.text();
  try {
    const json = JSON.parse(text);

    return json;
  } catch (e) {
    if (!isTesting) {
      console.error(e);
    }

    throw e;
  }
};

// These methods mimic the fetch API.

export function get(url: string, options: any = {}) {
  return authenticatedFetch(url, { method: 'GET', ...options });
}

export function put(url: string, options: any = {}) {
  const { data, ...restOptions } = options;

  return authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...restOptions
  });
}

export function post(url: string, options: any = {}) {
  const { data, ...restOptions } = options;

  return authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...restOptions
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

export default authenticatedFetch;


export function defaultHeaders() {
  const token = getToken();
  const orgId = getCurrentOrganizationId();

  return {
    ['Authorization']: `Bearer ${token}`,
    ['Organization']: `${orgId}`,
  };
}


import { JSONAPISerializer } from '@orbit/jsonapi';
import { api as apiEnv } from '@env';
import { defaultHeaders } from '@lib/fetch';

import { schema, keyMap } from './schema';

export const serializer = new JSONAPISerializer({ schema, keyMap });

// DEBUG!
// Orbit.fetch = (...args) => {
//   console.log(args);
//   return fetch(...args);
// };

export function defaultOptions() {
  return {
    sources: {
      remote: {
        settings: {
          ...defaultSourceOptions(),
        },
      },
    },
  };
}

export function defaultSourceOptions() {
  return {
    headers: {
      ...defaultHeaders(),
    },
    timeout: 60000,
  };
}

export const baseUrl = apiEnv.host ? `http://${apiEnv.host}/api` : '/api';

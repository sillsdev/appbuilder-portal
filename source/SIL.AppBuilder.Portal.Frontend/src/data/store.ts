import { Bucket } from '@orbit/core';
import Orbit, { Source } from '@orbit/data';
import Store from '@orbit/store';
import LocalStorageBucket from '@orbit/local-storage-bucket';
import IndexedDBBucket, { supportsIndexedDB } from '@orbit/indexeddb-bucket';
import Coordinator, {
  SyncStrategy,
  RequestStrategy,
  EventLoggingStrategy,
} from '@orbit/coordinator';
import JSONAPISource, { JSONAPISerializer } from '@orbit/jsonapi';
import IndexedDBSource from '@orbit/indexeddb';

import { api as apiEnv, app as appEnv } from '@env';

import authedFetch, { defaultHeaders } from '@lib/fetch';

import { schema, keyMap } from './schema';

const BucketClass = supportsIndexedDB ? IndexedDBBucket : LocalStorageBucket;

class CustomJSONAPISerializer extends JSONAPISerializer {
  // remoteId is used to track the difference between local ids and the
  // real id of the server.  This is done so that orbit can maintain
  // relationships before persisting them to the remote host.
  // (before persisting, there are no known ids)
  //
  // resourceKey just defines what local key is used for the id
  // received from the server
  //
  // remoteIds will be set when the JSONAPISource receives records
  resourceKey(type: string) {
    return 'remoteId';
  }
}

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
  };
}

export const baseUrl = apiEnv.host ? `http://${apiEnv.host}/api` : '/api';

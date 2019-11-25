import Store from '@orbit/store';
import { JSONAPIDocument } from '@orbit/jsonapi';
import { TransformBuilder } from '@orbit/data';
import { pushPayload, recordIdentityFrom } from 'react-orbitjs';
import { camelize } from '@orbit/utils';

import { JSONAPIOperationsPayload } from './types';

function toOrbitType(store: Store, apiType: string) {
  let camel = camelize(apiType);
  let knownModels = Object.keys(store.schema.models);

  if (knownModels.includes(camel)) {
    return camel;
  }

  // try singularizing
  let singular = camel.slice(0, -1);
  if (knownModels.includes(singular)) {
    return singular;
  }

  throw new Error(
    `type from api, ${apiType}, could not be convert to a known type in the orbit schema. Tried: ${camel} and ${singular}. Known: ${knownModels.join(
      ', '
    )}`
  );
}

export function dataToLocalCache(store: Store, data: JSONAPIOperationsPayload | JSONAPIDocument) {
  if ((data as JSONAPIDocument).data) {
    return pushPayload(store, data);
  }

  if ((data as JSONAPIOperationsPayload).operations) {
    (data as JSONAPIOperationsPayload).operations.forEach((operation) => {
      let removedRecords = [];
      let transforms = [];

      let operationData;

      switch (operation.op) {
        case 'get':
        case 'update':
        case 'add':
          pushPayload(store, { ...operation });
          break;
        case 'remove':
          operationData = operation.data || operation.ref;
          removedRecords = Array.isArray(operationData) ? operationData : [operationData];

          removedRecords.forEach((record) => {
            let recordIdentity = recordIdentityFrom(
              store,
              record.id,
              toOrbitType(store, record.type)
            );
            // was this record already removed from the cache?
            // maybe we are receiving an operations payload that is telling us
            // to remove something that we've already removed.
            let exists = false;

            try {
              exists = store.cache.query((q) => q.findRecord(recordIdentity));
            } catch (e) {
              // don't care if this throws an exception;
            }

            if (exists) {
              transforms.push((t) => t.removeRecord(recordIdentity));
            }
          });

          store.update((t: TransformBuilder) => transforms.map((transform) => transform(t)), {
            skipRemote: true,
          });
          break;
        default:
          throw new Error('op is not a valid operation');
      }
    });
  }
}

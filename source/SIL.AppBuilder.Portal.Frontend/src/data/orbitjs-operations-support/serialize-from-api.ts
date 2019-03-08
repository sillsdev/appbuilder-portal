import Store from '@orbit/store';
import { JSONAPIDocument } from '@orbit/jsonapi';
import { TransformBuilder } from '@orbit/data';
import { pushPayload, localIdFromRecordIdentity } from 'react-orbitjs';

import { JSONAPIOperationsPayload } from './types';

export function dataToLocalCache(store: Store, data: JSONAPIOperationsPayload | JSONAPIDocument) {
  if ((data as JSONAPIDocument).data) {
    pushPayload(store, data);
  }

  if ((data as JSONAPIOperationsPayload).operations) {
    (data as JSONAPIOperationsPayload).operations.forEach((operation) => {
      let removedRecords = [];
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

          store.update(
            (t: TransformBuilder) =>
              removedRecords.map((record) => {
                let localId = localIdFromRecordIdentity(store, record);

                return t.removeRecord({ type: record.type, id: localId });
              }),
            { skipRemote: true }
          );
          break;
        default:
          throw new Error('op is not a valid operation');
      }
    });
  }
}

import Store from "@orbit/store";
import { JSONAPIDocument } from "@orbit/jsonapi";
import { pushPayload, localIdFromRecordIdentity } from "react-orbitjs";
import { JSONAPIOperationsPayload } from "./types";

export function dataToLocalCache(store: Store, data: JSONAPIOperationsPayload | JSONAPIDocument) {
  if ((data as JSONAPIDocument).data) {
    pushPayload(store, data);
  }

  if ((data as JSONAPIOperationsPayload).operations) {
    (data as JSONAPIOperationsPayload).operations.forEach(operation => {
      switch (operation.op) {
        case 'get':
        case 'update':
        case 'add':
          pushPayload(store, operation.data);
        case 'remove':
          let removedRecords = Array.isArray(operation.data) ? operation.data : [operation.data];

          store.update(q => (removedRecords.map(record => {
            let localId = localIdFromRecordIdentity(store, record);

            return q.removedRecord({ type: record.type, id: localId });
          })),
            { skipRemote: true }
          );

          removedRecords.forEach(resource => {
          });
        default:
          throw new Error('op is not a valid operation');
      }
    });
  }
}

import { useEffect, useMemo } from 'react';
import { useOrbit, pushPayload } from 'react-orbitjs';
import { HubConnectionFactory } from '@ssv/signalr-client';

import { useCurrentUser } from '~/data/containers/with-current-user';

import { isTesting } from '~/env';
import { serializer } from '~/data/store';

import {
  RecordOperation,
  buildTransform,
  TransformOrOperations,
  Operation,
  Transform,
  AddRecordOperation,
  RemoveRecordOperation,
  AddToRelatedRecordsOperation,
  RemoveFromRelatedRecordsOperation,
  ReplaceRelatedRecordOperation,
  ReplaceRelatedRecordsOperation,
  ReplaceAttributeOperation,
  RecordIdentity,
  cloneRecordIdentity,
  ReplaceRecordOperation,
  TransformBuilder,
} from '@orbit/data';
import { clone, deepSet, Dict } from '@orbit/utils';

import { DataClient } from './clients';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import JSONAPISource, { Resource, JSONAPIDocument } from '@orbit/jsonapi';
import { ResourceDocument } from '@orbit/jsonapi/dist/modules/es2017';

export interface OperationsResponse {
  operations: JSONAPIDocument[];
}

export default function LiveDataManager({ children }) {
  const { dataStore, sources } = useOrbit();
  const { currentUser } = useCurrentUser();

  const isLoggedIn = !!currentUser;
  const hubFactory = useMemo(() => new HubConnectionFactory(), [isLoggedIn]);
  const dataClient = useMemo(() => new DataClient(hubFactory, dataStore), [isLoggedIn]);
  const subscriptions = useMemo(() => [], [isLoggedIn]);

  useEffect(() => {
    if (!isTesting && !isLoggedIn) {
      return;
    }

    dataClient.start();

    return function disconnect() {
      dataClient.stop();
      hubFactory.disconnectAll();
    };
  }, [isLoggedIn]);

  const pushData = (transforms: TransformOrOperations): Observable<OperationsResponse> => {
    const data = transformsToJSONAPIOperations(
      sources.remote as JSONAPISource,
      dataStore.transformBuilder,
      transforms
    );

    return dataClient.connection.invoke<string>('PerformOperations', JSON.stringify(data)).pipe(
      map<string, OperationsResponse>((json: string) => {
        const response: OperationsResponse = JSON.parse(json);

        pushPayload(dataStore, {
          data: response.operations.map((operation: JSONAPIDocument) => operation.data),
        });

        return response;
      })
    );
  };

  return children({ socket: dataClient, pushData, subscriptions });
}

/**
 * TODO: import everything below from orbit.js when Operations stuff is merged
 */

interface JSONAPIOperationsPayload {
  operations: JSONAPIOperation[];
}

export function transformsToJSONAPIOperations(
  source: JSONAPISource,
  transformBuilder: TransformBuilder,
  transforms: TransformOrOperations
): JSONAPIOperationsPayload {
  const transform = buildTransform(transforms, undefined, undefined, transformBuilder);
  const operations = transformsToOperationsData(source, transform);

  const data = {
    operations,
  };

  return data;
}

function transformsToOperationsData(
  source: JSONAPISource,
  transform: Transform
): JSONAPIOperation[] {
  return transform.operations.map((orbitOperation: Operation) => {
    const converter = TransformToOperationData[orbitOperation.op];

    return converter(source, orbitOperation);
  });
}

interface JSONAPIOperation {
  op: 'get' | 'add' | 'update' | 'remove';
  ref: {
    type: string;
    id?: string | number;
    relationship?: string;
  };
  data?: Resource | Resource[];
}

function toRecordIdentity(record: Resource): RecordIdentity {
  const { type, id } = record;

  return { type, id };
}

type TransformToOperationFunction = (source: JSONAPISource, operation: any) => JSONAPIOperation;

export const TransformToOperationData: Dict<TransformToOperationFunction> = {
  addRecord({ serializer }: JSONAPISource, operation: AddRecordOperation): JSONAPIOperation {
    const resource = serializer.serializeRecord(operation.record);
    const { type, id } = resource;

    return {
      op: 'add',
      ref: { type, id },
      data: resource,
    };
  },

  removeRecord({ serializer }: JSONAPISource, operation: RemoveRecordOperation): JSONAPIOperation {
    const { type, id } = serializer.serializeRecord(operation.record);

    return {
      op: 'remove',
      ref: { type, id },
    };
  },

  replaceRecord(
    { serializer }: JSONAPISource,
    operation: ReplaceRecordOperation
  ): JSONAPIOperation {
    const resource = serializer.serializeRecord(operation.record);
    const { type, id } = resource;

    return {
      op: 'update',
      ref: { type, id },
      data: resource,
    };
  },

  updateRecord({ serializer }: JSONAPISource, operation: ReplaceRecordOperation): JSONAPIOperation {
    const resource = serializer.serializeRecord(operation.record);
    const { type, id } = resource;

    return {
      op: 'update',
      ref: { type, id },
      data: resource,
    };
  },

  replaceAttribute(
    { serializer }: JSONAPISource,
    operation: ReplaceAttributeOperation
  ): JSONAPIOperation {
    const resource = serializer.serializeRecord(operation.record);
    const { type, id } = resource;
    const record = toRecordIdentity(resource);

    replaceRecordAttribute(record, operation.attribute, operation.value);

    return {
      op: 'update',
      ref: { type, id },
      data: record,
    };
  },

  addToRelatedRecords(
    { serializer }: JSONAPISource,
    operation: AddToRelatedRecordsOperation
  ): JSONAPIOperation {
    const relatedResource = serializer.serializeRecord(operation.relatedRecord);
    const { type, id } = serializer.serializeRecord(operation.record);
    const { relationship } = operation;

    return {
      op: 'add',
      ref: { type, id, relationship },
      data: relatedResource,
    };
  },

  removeFromRelatedRecords(
    { serializer }: JSONAPISource,
    operation: RemoveFromRelatedRecordsOperation
  ): JSONAPIOperation {
    const { type, id } = serializer.serializeRecord(operation.record);
    const { relationship } = operation;
    const relatedResource = serializer.serializeRecord(operation.relatedRecord);

    return {
      op: 'remove',
      ref: { type, id, relationship },
      data: relatedResource,
    };
  },

  replaceRelatedRecord(
    { serializer }: JSONAPISource,
    operation: ReplaceRelatedRecordOperation
  ): JSONAPIOperation {
    const { type, id } = serializer.serializeRecord(operation.record);
    const { relationship, relatedRecord } = operation;
    const data = relatedRecord ? serializer.resourceIdentity(relatedRecord) : null;

    return {
      op: 'update',
      ref: { type, id, relationship },
      data,
    };
  },

  replaceRelatedRecords(
    { serializer }: JSONAPISource,
    operation: ReplaceRelatedRecordsOperation
  ): JSONAPIOperation {
    const { type, id } = serializer.serializeRecord(operation.record);
    const { relationship, relatedRecords } = operation;
    const data = relatedRecords.map((r) => serializer.resourceIdentity(r));

    return {
      op: 'update',
      ref: { type, id, relationship },
      data,
    };
  },
};

// these currently are not exported from orbit.js
function replaceRecordAttribute(record: RecordIdentity, attribute: string, value: any) {
  deepSet(record, ['attributes', attribute], value);
}

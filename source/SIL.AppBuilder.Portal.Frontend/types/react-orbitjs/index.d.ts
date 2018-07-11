import * as React from 'react';
import Store from '@orbit/store';
import { TransformOrOperations, QueryBuilder } from '@orbit/data';

// To future readers, and JV, I apologize for the any usage.


export interface DataProviderProps {
  dataStore: Store;
}
export class DataProvider extends React.Component<DataProviderProps> {}

export interface RecordsToProps {
  [key: string]: (q: QueryBuilder) => any
}

export interface WithData {
  dataStore: Store;
}

// https://github.com/exivity/react-orbitjs/blob/master/src/components/withData.js
export type WithDataProps =
  & {
    queryStore: () => any;
    updateStore: (transformOrOperations: TransformOrOperations, options?: object, id?: string) => any;
  }
  & WithData


type MapRecordsToPropsFn = (...args: any[]) => RecordsToProps;

export type MapRecordsToProps =
  | RecordsToProps
  | MapRecordsToPropsFn

export function withData(mapRecordsToProps: MapRecordsToProps):
  <Props, State>(
    WrappedComponent: React.Component<any, any, any> & { setState(): void}
  ) => React.Component<Props, State>;

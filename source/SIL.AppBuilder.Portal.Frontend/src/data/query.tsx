import React, { useState, useReducer, useEffect, useCallback, Reducer } from 'react';
import { ErrorMessage, useOrbit } from 'react-orbitjs';
import JSONAPISource from '@orbit/jsonapi';
import { QueryExpression } from '@orbit/data';

interface IProvidedDefaultProps {
  error?: Error;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export type IProvidedProps<T> = IProvidedDefaultProps & T;

export interface IQueryOptions {
  passthroughError?: boolean;
  useRemoteDirectly?: boolean;
  noTimeout?: boolean;
  timeout?: number;
  mapResultsFn?: (props: any, result: any, hocProps?: any) => Promise<any>;
  additionalProps?: any;
}

const defaultOptions = {
  passthroughError: false,
  useRemoteDirectly: false,
  mapResultsFn: null,
  noTimeout: false,
  timeout: 5000,
};

const START = 'start';
const FINISH = 'finish';
const ERROR = 'error';

const initialState = {
  result: {},
  error: undefined,
  isLoading: false,
};

const actions = {
  [START](state) {
    return {
      ...state,
      isLoading: true,
      error: undefined,
    };
  },
  [FINISH](state, { result }) {
    return {
      ...state,
      result,
      isLoading: false,
      error: undefined,
    };
  },
  [ERROR](state, { error }) {
    return {
      ...state,
      error,
      isLoading: false,
    };
  },
};

function reducer(state, action) {
  return actions[action.type](state, action);
}

interface IState {
  result: any;
  error: Error | string | undefined;
  isLoading: boolean;
}

interface IQueryTermMap {
  [key: string]: [QueryExpression];
}

function buildQueryTermMap(queryBuilderMap, queryBuilder) {
  const queryTermMap: IQueryTermMap = {};

  const queryBuilderKeys = Object.keys(queryBuilderMap).filter((k) => k !== 'cacheKey');

  queryBuilderKeys.forEach((key) => {
    const query = queryBuilderMap[key];
    const args = typeof query === 'function' ? [query] : query;

    args[0] = args[0](queryBuilder);

    queryTermMap[key] = args;
  });

  return queryTermMap;
}

export function useQuery(queryBuilderMap: IQueryTermMap, options: IQueryOptions = {}) {
  const { /* useRemoteDirectly, */ mapResultsFn, additionalProps } = options;

  const {
    dataStore,
    dataStore: { queryBuilder },
    sources: { remote },
  } = useOrbit();

  const queryTermMap = buildQueryTermMap(queryBuilderMap, queryBuilder);
  const queryKeys = Object.keys(queryTermMap);
  const hasQueries = queryKeys.length > 0;

  const [{ result, error, isLoading }, dispatch] = useReducer<Reducer<IState, any>>(
    reducer,
    initialState
  );

  const hasResults = Object.keys(result).length > 0;
  const [needsFetch, setNeedsFetch] = useState(!hasResults);

  // TODO: there may be a bug with dataStore.query in some situations
  //       where the promise never resolves?
  const querier = remote; //useRemoteDirectly ? remote : dataStore;

  const refetch = useCallback(() => {
    setNeedsFetch(true);
  }, []);

  const tryFetch = useCallback(() => {
    if (isLoading) return;
    if (!hasQueries) return;
    if (hasResults && !needsFetch) return;

    const responses = {};

    dispatch({ type: START });

    const requestPromises = queryKeys.map(async (key: string) => {
      const query = queryTermMap[key];

      try {
        const queryResult = await (querier as JSONAPISource).query(...query);
        responses[key] = queryResult;

        return queryResult;
      } catch (e) {
        if (querier === remote) {
          querier.requestQueue.skip();
        }

        throw e;
      }
    });

    Promise.all(requestPromises)
      .then(async () => {
        let mapped = mapResultsFn
          ? await mapResultsFn(dataStore, responses, additionalProps || {})
          : responses;

        dispatch({ type: FINISH, result: mapped });

        setNeedsFetch(false);
      })
      .catch((error) => {
        dispatch({ type: ERROR, error });
      });
  }, [queryTermMap, needsFetch, hasResults]);

  useEffect(() => {
    if (needsFetch) {
      tryFetch();
    }
  }, [needsFetch]);

  useEffect(() => {
    setNeedsFetch(true);
  }, [JSON.stringify(queryTermMap)]);

  return { error, isLoading, refetch, result };
}

// Example Usage
//
// import { query } from '@data';
//
// export default compose(
//   query((passedProps) => {
//
//     return {
//       someKey: q => q.findRecord(...),
//       someOtherKey: [q => q.findRecord, { /* source options */ }]
//     }
//   })
// )(SomeComponent);
//
//
// Why does this exist?
// the react-orbitjs addon actually doesn't give is much.
// it has a "lot" of cache-related handling, but no ergonomic
// way to actually make network requests.
//
// TODO: tie in to react-orbitjs' cache handling.
// TODO: what if we just use orbit directly? do we need react-orbitjs?
export function query(mapRecordsToProps: any, options?: IQueryOptions) {
  let map: any;
  const opts = {
    ...defaultOptions,
    ...(options || {}),
  };

  const { passthroughError, useRemoteDirectly, mapResultsFn } = opts;

  if (typeof mapRecordsToProps !== 'function') {
    map = (/* props */) => ({
      cacheKey: 'default-cache-key',
      ...mapRecordsToProps,
    });
  } else {
    map = mapRecordsToProps;
  }

  return (InnerComponent: any) => {
    return function DataWrapper(props) {
      const queryBuilderMap = map(props);

      const { error, result, isLoading, refetch } = useQuery(queryBuilderMap, {
        mapResultsFn,
        useRemoteDirectly,
        additionalProps: props,
      });

      if (!passthroughError && error) {
        return <ErrorMessage error={error} />;
      }

      return (
        <InnerComponent
          {...props}
          {...{
            ...result,
            error,
            isLoading,
            refetch,
          }}
        />
      );
    };
  };
}

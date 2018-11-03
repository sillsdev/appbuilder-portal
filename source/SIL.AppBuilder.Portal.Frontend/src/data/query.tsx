import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { defaultSourceOptions } from '@data';
import { ErrorMessage } from '@ui/components/errors';
import { isEmpty } from '@lib/collection';

interface IState {
  result: object;
  error: any;
  isLoading: boolean;
}

export interface IQueryOptions {
  passthroughError?: boolean;
  useRemoteDirectly?: boolean;
}

// Example Usage
//
// import { query } from '@data';
//
// const mapRecordsToProps = (passedProps) => {
//
//   return {
//     someKey: q => q.findRecord(...),
//     someOtherKey: [q => q.findRecord, { /* source options */ }]
//   }
// }
//
// // ......
//
// export default compose(
//    query(mapRecordsToProps)
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
export function queryApi<T>(mapRecordsToProps, options?: IQueryOptions) {
  let map;
  const opts = options || { passthroughError: false, useRemoteDirectly: false };
  const { passthroughError, useRemoteDirectly } = opts;


  if (typeof mapRecordsToProps !== 'function') {
    map = (/* props */) => ({
      cacheKey: 'default-cache-key',
      ...mapRecordsToProps
    });
  } else {
    map = mapRecordsToProps;
  }

  return InnerComponent => {
    class DataWrapper extends React.Component<T & WithDataProps, IState> {
      state = { result: {}, error: undefined, isLoading: false };

      mapResult: any = {};

      componentDidMount() {
        this.tryFetch();
      }

      componentDidUpdate() {
        this.tryFetch();
      }

      fetchData = async () => {
        const result = map(this.props);

        const { dataStore, sources: { remote } } = this.props;
        const querier = useRemoteDirectly ? remote : dataStore;

        this.setState({ isLoading: true });

        const responses = {};
        const requestPromises = Object.keys(result).map(async (key: string) => {
          if (key === 'cacheKey') { return; }

          const query = result[key];
          const args = typeof query === 'function' ? [query] : query;

          const queryResult = await querier.query(...args);

          responses[key] = queryResult;

          return queryResult;
        });

        try {
          await Promise.all(requestPromises);
        } catch (e) {
          console.error('responses:', responses, 'error:', e);
          this.setState({ error: e });
        }

        return responses;
      }

      tryFetch = async () => {
        if (!this.isFetchNeeded()) { return; }

        this.setState({ isLoading: true }, async () => {
          const result = await this.fetchData();

          this.setState({ result, isLoading: false });
        });
      }

      isFetchNeeded = () => {
        const result = map(this.props);

        if (arePropsEqual(result, this.mapResult)) {
          return false;
        }

        this.mapResult = result;

        return true;
      }

      render() {
        const { result, error, isLoading } = this.state;
        const dataProps = {
          ...result,
          error,
          isLoading
        };

        if (!passthroughError && error) {
          return <ErrorMessage error={error} />;
        }


        return <InnerComponent { ...this.props } { ...dataProps } />;
      }
    }

    return withOrbit({})(DataWrapper);
  };
}


// This is a stupid way to 'deeply' compare things.
// But it kinda works.
// Functions are omitted from the comparison
function arePropsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

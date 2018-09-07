import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { defaultSourceOptions } from '@data';
import { ErrorMessage } from '@ui/components/errors';
import { isEmpty } from '@lib/collection';

interface IState {
  result: object;
  error: any;
}

export interface IQueryOptions {
  passthroughError?: boolean;
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
// TODO: investigate why we would use react-orbitjs' cache over orbit's
// TODO: what if we just use orbit directly? do we need react-orbitjs?
export function queryApi<T>(mapRecordsToProps, options?: IQueryOptions) {
  let map;
  const opts = options || { passthroughError: false };
  const { passthroughError } = opts;


  if (typeof mapRecordsToProps !== 'function') {
    map = (props) => ({
      cacheKey: 'default-cache-key',
      ...mapRecordsToProps
    });
  } else {
    map = mapRecordsToProps;
  }

  return InnerComponent => {
    class DataWrapper extends React.Component<T & WithDataProps, IState> {
      state = { result: {}, error: undefined };

      mapResult: any = {};

      // TODO: find a non-hacky way to achieve this behavior
      //       calling fetchData every render is bad, and could cause
      //       infinite loops if cache is not properly maintained...
      //
      // NOTE: componentWillUpdate / componentWillReceiveProps
      //       were removed...
      //
      // this needs concurrency handling
      // "take latest" "take last" etc
      fetchData = async () => {
        const result = map(this.props);

        if (arePropsEqual(result, this.mapResult)) {
          return;
        }

        this.mapResult = result;

        const { dataStore } = this.props;

        const responses = {};
        const requestPromises = Object.keys(result).map(async (key: string) => {
          if (key === 'cacheKey') { return; }

          const query = result[key];
          const args = typeof query === 'function' ? [query] : query;

          const queryResult = await dataStore.query(...args);

          responses[key] = queryResult;

          return queryResult;
        });

        try {
          await Promise.all(requestPromises);
        } catch (e) {
          console.error(responses, e);
          this.setState({ error: e });
        }

        this.setState({ result: responses });
      }

      render() {
        this.fetchData();

        const { result, error } = this.state;
        const dataProps = {
          ...result,
          error
        };

        if (!passthroughError && error) {
          return <ErrorMessage error={error} />;
        }


        return <InnerComponent { ...dataProps } { ...this.props } />;
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

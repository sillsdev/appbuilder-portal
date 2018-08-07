import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { ErrorMessage } from '@ui/components/errors';

interface IState {
  result: object;
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
export function queryApi<T>(mapRecordsToProps) {
  let map;

  if (typeof mapRecordsToProps !== 'function') {
    map = (props) => mapRecordsToProps;
  } else {
    map = mapRecordsToProps;
  }

  return InnerComponent => {
    class DataWrapper extends React.Component<T, IState> {
      state = { result: {}, error: undefined };

      componentDidMount() {
        this.fetchData();
      }

      fetchData = async () => {

        const result = map(this.props);
        const { queryStore } = this.props;

        const responses = {};
        const requestPromises = Object.keys(result).map(async (key: string) => {
          const query = result[key];
          const args = typeof query === 'function' ? [query] : query;

          const queryResult = await queryStore(...args);

          responses[key] = queryResult;

          return queryResult;
        });

        try {
          await Promise.all(requestPromises);
        } catch (e) {
          this.setState({ error: e });
        }

        this.setState({ result: responses });
      }

      render() {
        const { result, error } = this.state;
        const dataProps = {
          ...result
        };

        if (error) {
          return <ErrorMessage error={error} />;
        }


        return <InnerComponent { ...dataProps } { ...this.props } />;
      }
    }

    return withOrbit({})(DataWrapper);
  };
}

import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { DataSocket } from '~/sockets';
import Store from '@orbit/store';

interface ILiveDataContext {
  dataStore: Store;
  sources: object;
  queryStore: any;
  updateStore: any;
  pushOperations: (operationData: object) => void;
}

const DataContext = React.createContext<ILiveDataContext>({
  dataStore: undefined,
  sources: undefined,
  queryStore: undefined,
  updateStore: undefined,
  pushOperations: undefined,
});

export const LiveDataProvider = withOrbit({})(
  class extends React.Component<WithDataProps> {
    render() {
      const { dataStore, sources, updateStore, queryStore, children } = this.props;

      return (
        <DataSocket>
          {({ pushOperations }) => {
            return (
              <DataContext.Provider
                value={{ dataStore, sources, updateStore, queryStore, pushOperations }}
              >
                {children}
              </DataContext.Provider>
            );
          }}
        </DataSocket>
      );
    }
  }
);

export function withLiveData(InnerComponent) {
  return (props) => {
    return (
      <DataContext.Consumer>
        {(context) => <InnerComponent {...props} {...context} />}
      </DataContext.Consumer>
    );
  };
}

import React, { useContext } from 'react';
import { useOrbit } from 'react-orbitjs';

import { DataSocket } from '~/sockets';

import Store from '@orbit/store';

interface ILiveDataContext {
  dataStore: Store;
  sources: object;
  pushOperations: (operationData: object) => void;
}

const DataContext = React.createContext<ILiveDataContext>({
  dataStore: undefined,
  sources: undefined,
  pushOperations: undefined,
});

export function useLiveData(subscribeTo?: string) {
  // const { dataStore } = useOrbit();
  const { pushOperations } = useContext(DataContext);

  return {
    pushOperations,
  };
}

export function LiveDataProvider({ children }) {
  const { dataStore, sources } = useOrbit();

  return (
    <DataSocket>
      {({ pushOperations }) => {
        return (
          <DataContext.Provider value={{ dataStore, sources, pushOperations }}>
            {children}
          </DataContext.Provider>
        );
      }}
    </DataSocket>
  );
}

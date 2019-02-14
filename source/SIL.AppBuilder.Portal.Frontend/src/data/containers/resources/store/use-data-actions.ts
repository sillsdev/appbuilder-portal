import { useOrbit } from 'react-orbitjs';
import { create, update } from '@data/store-helpers';

// TODO: could this be generically extracted to react-orbitjs?
export function useDataActions() {
  const { dataStore } = useOrbit();

  return {
    create: createRecord(dataStore),
    update: updateRecord(dataStore),
  };
}

function createRecord(dataStore) {
  return async (attributes, relationships) => {
    await create(dataStore, 'store', {
      attributes,
      relationships,
    });
  };
}

function updateRecord(dataStore) {
  return async (resource, attributes, relationships) => {
    await update(dataStore, resource, {
      attributes,
      relationships,
    });
  };
}

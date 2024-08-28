import { useOrbit } from 'react-orbitjs/dist';
import { defaultOptions } from '@data';

import { ProductAttributes } from '~/data/models/product';

export function useDataActions(product) {
  const { dataStore } = useOrbit();

  const updateAttribute = async (attribute: string, value: any) => {
    await dataStore.update((q) => q.replaceAttribute(product, attribute, value), defaultOptions());
  };

  const updateAttributes = async (attributes: ProductAttributes) => {
    const { id, type } = product;

    return dataStore.update(
      (q) =>
        q.replaceRecord({
          id,
          type,
          attributes,
        }),
      defaultOptions()
    );
  };

  return {
    updateAttributes,
    updateAttribute,
  };
}

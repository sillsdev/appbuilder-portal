import * as React from 'react';
import { useOrbit } from 'react-orbitjs';
import ProductArtifact from '@ui/components/product-artifact';

import './styles.scss';

export default function Files({ project }) {
  const { dataStore } = useOrbit();
  const products = dataStore.cache.query((q) => q.findRelatedRecords(project, 'products'));

  return (
    <div data-test-project-files className='flex flex-column'>
      {products.map((product) => (
        <ProductArtifact key={product.id} product={product} />
      ))}
    </div>
  );
}

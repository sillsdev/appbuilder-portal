import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { ProductResource } from '@data';
import ProductArtifact from './product-artifact';

import './styles.scss';

interface IOwnProps {
  products: ProductResource[];
}

type IProps =
  & IOwnProps;

const mapRecordsToProps = (passedProps) => {
  const { project } = passedProps;

  return {
    products: q => q.findRelatedRecords(project, 'products')
  };
};

class Files extends React.Component<IProps> {

  render() {

    const { products } = this.props;

    return (
      <div data-test-project-files className='flex flex-column'>
      {
        products.map((product, i) =>
          <ProductArtifact key={i} product={product} />
        )
      }
      </div>
    );
  }
}

export default compose(
  withOrbit(mapRecordsToProps)
)(Files);
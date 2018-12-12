import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { ProductResource, ProjectResource } from '@data';
import ProductArtifact from '@ui/components/product-artifact';

import './styles.scss';

interface IExpectedProps {
  project: ProjectResource;
}

interface IOwnProps {
  products: ProductResource[];
}

type IProps =
  & IExpectedProps
  & IOwnProps;

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

export default compose<IProps, IExpectedProps>(

  withOrbit((passedProps: IExpectedProps) => {
    const { project } = passedProps;

    return {
      products: q => q.findRelatedRecords(project, 'products')
    };
  })
)(Files);

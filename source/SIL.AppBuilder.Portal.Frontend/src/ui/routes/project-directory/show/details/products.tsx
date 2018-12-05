import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { ProjectResource, ProductResource } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';

import ProductArtifact from '@ui/components/product-artifact';

interface IOwnProps {
  project: ProjectResource;
  products: ProductResource[];
}

type IProps =
  & IOwnProps
  & i18nProps;

class Products extends React.Component {
  render() {
    const { products } = this.props;

    return (
      <div data-test-products>
        {products.map((product, i) => {
          return <ProductArtifact key={i} product={product} />;
        })}
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit((passedProps: IProps) => {
    const { project } = passedProps;

    return {
      products: q => q.findRelatedRecords(project, 'products'),
    };
  })
)(Products);
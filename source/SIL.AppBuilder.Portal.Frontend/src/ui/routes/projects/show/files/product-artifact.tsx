import * as React from 'react';
import { compose } from 'recompose';
import { titleize } from 'inflected';
import { withData as withOrbit } from 'react-orbitjs';

import ProductIcon from '@ui/components/product-icon';
import {
  ProductDefinitionResource,
  ProductArtifactResource,
  attributesFor
} from '@data';
import Artifact from './artifact';
import EmptyLabel from '@ui/components/labels/empty';
import { isEmpty } from '@lib/collection';

interface IOwnProps {
  productDefinition: ProductDefinitionResource;
  artifacts: ProductArtifactResource[];
}

type IProps =
  & IOwnProps;

const mapRecordsToProps = (passedProps) => {
  const { product } = passedProps;

  return {
    productDefinition: q => q.findRelatedRecord(product, 'productDefinition'),
    artifacts: q => q.findRelatedRecords(product, 'artifacts')
  };
};

class ProductArtifact extends React.Component<IProps> {

  humanReadableName = () => {
    const { productDefinition } = this.props;
    const { name } = attributesFor(productDefinition);

    const readableName = titleize(name);

    return readableName;
  }

  render() {

    const { productDefinition, artifacts } = this.props;

    return (
      <div className='product-artifact w-100 m-b-lg'>
        <div className='header flex align-items-center'>
          <ProductIcon product={productDefinition}/>
          <span
            data-test-project-files-product-name
            className='m-l-sm'
          >
            {this.humanReadableName()}
          </span>
        </div>
        <div className='list'>
          <EmptyLabel
            className='m-l-lg m-b-lg'
            condition={!isEmpty(artifacts)}
            label={'No artifacts'}
          >
            {
              artifacts.map((artifact, i) =>
                <Artifact key={i} artifact={artifact} includeHeader={i === 0}/>
              )
            }
          </EmptyLabel>
        </div>
      </div>
    );

  }

}

export default compose(
  withOrbit(mapRecordsToProps)
)(ProductArtifact);
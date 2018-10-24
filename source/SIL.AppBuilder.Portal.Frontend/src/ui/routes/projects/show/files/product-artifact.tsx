import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { ProductDefinitionResource, ProductArtifactResource, attributesFor } from '@data';
import ProductIcon from '@ui/components/product-icon';

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

  render() {

    const { productDefinition, artifacts } = this.props;
    const { name } = attributesFor(productDefinition);

    return (
      <div className='product-artifact w-100'>
        <div className='header flex align-items-center'>
          <ProductIcon product={productDefinition}/>
          <span className='m-l-sm'>{name}</span>
        </div>
        <div className='m-t-md'>
          {
            artifacts.map((artifact, i) => {
              const { artifactType, url } = attributesFor(artifact);
              return (
                <div className='flex'>
                  <div className='w-70'>
                    { artifactType }
                  </div>
                  <div className='w-30'>
                    {url}
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );

  }

}

export default compose(
  withOrbit(mapRecordsToProps)
)(ProductArtifact);
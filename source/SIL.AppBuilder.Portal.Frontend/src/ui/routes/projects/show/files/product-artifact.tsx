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
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  productDefinition: ProductDefinitionResource;
  artifacts: ProductArtifactResource[];
}

type IProps =
  & IOwnProps
  & i18nProps;

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

    const { productDefinition, artifacts, t } = this.props;

    return (
      <div className='product-artifact w-100 m-b-lg'>
        <div className='header flex align-items-center p-md bold'>
          <ProductIcon product={productDefinition}/>
          <span
            data-test-project-files-product-name
            className='m-l-sm'
          >
            {this.humanReadableName()}
          </span>
        </div>
        <div>
          <EmptyLabel
            className='m-t-lg m-l-lg m-b-lg'
            condition={!isEmpty(artifacts)}
            label={t('project.products.noArtifacts')}
          >
            <div className='flex p-l-md p-t-sm p-b-sm p-r-md gray-text bold'>
              <div className='flex-70'>
                <span>{t('project.products.filename')}</span>
              </div>
              <div className='flex flex-30'>
                <div className='flex-grow'>
                  <span>{t('project.products.updated')}</span>
                </div>
                <div className='flex-30 text-align-right'>
                  <span className='m-r-md'>{t('project.products.size')}</span>
                </div>
                <div className='flex-10'/>
              </div>
            </div>
            {
              artifacts.map((artifact, i) =>
                <Artifact key={i} artifact={artifact}/>
              )
            }
          </EmptyLabel>
        </div>
      </div>
    );

  }

}

export default compose(
  withTranslations,
  withOrbit(mapRecordsToProps)
)(ProductArtifact);
import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import ProductIcon from '@ui/components/product-icon';
import {
  ProductDefinitionResource,
  ProductArtifactResource,
  ProductResource,
  ProductBuildResource,
  attributesFor
} from '@data';
import Artifact from './artifact';
import EmptyLabel from '@ui/components/labels/empty';
import { isEmpty } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';

import Header from './header';

interface IExpectedProps {
  product: ProductResource;
  productBuild: ProductBuildResource;
}

interface IOwnProps {
  productDefinition: ProductDefinitionResource;
  artifacts: ProductArtifactResource[];
}

interface IState {
  areArtifactsVisible: boolean;
}

type IProps =
  & IOwnProps
  & i18nProps;

class ProductArtifact extends React.Component<IProps, IState> {
  state = { areArtifactsVisible: false };

  toggleShowArtifacts = () => {
    this.setState({ areArtifactsVisible: !this.state.areArtifactsVisible });
  }

  render() {
    const { artifacts, t } = this.props;
    const { areArtifactsVisible } = this.state;

    return (
      <div data-test-product-artifacts className='product-artifact w-100 m-b-lg'>
        <Header {...this.props} onClick={this.toggleShowArtifacts} isCollapsed={areArtifactsVisible} />

        {areArtifactsVisible && (
          <div data-test-artifact-list-container>
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

              { artifacts.map((artifact, i) =>
                <Artifact key={i} artifact={artifact}/>
              )}

            </EmptyLabel>
          </div>
        )}
      </div>
    );

  }

}

export default compose<IProps, IExpectedProps>(
  withTranslations,
  withOrbit((passedProps: IExpectedProps) => {
    const { productBuild, product } = passedProps;

    return {
      productDefinition: q => q.findRelatedRecord(product, 'productDefinition'),
      artifacts: q => q.findRelatedRecords(productBuild, 'artifacts')
    };
  })
)(ProductArtifact);

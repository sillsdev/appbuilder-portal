import * as React from 'react';
import { compose, withProps } from 'recompose';

import { query, buildOptions, withLoader, ProductDefinitionResource, attributesFor } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compareVia } from '@lib/collection';

import { addProductDefinitionPathName } from '../index';

import ProductDefinitionItem from './item';

interface IOwnProps {
  productDefinitions: ProductDefinitionResource[];
}

type IProps = IOwnProps & i18nProps & RouteComponentProps<{}>;

class ListProductDefinition extends React.Component<IProps> {
  showAddForm = (e) => {
    e.preventDefault();
    const { history } = this.props;
    history.push(addProductDefinitionPathName);
  };

  render() {
    const { t, productDefinitions } = this.props;

    return (
      <>
        <h2 className='sub-page-heading'>{t('admin.settings.productDefinitions.title')}</h2>
        <div className='m-b-xxl'>
          <button className='ui button tertiary uppercase large m-b-lg' onClick={this.showAddForm}>
            {t('admin.settings.productDefinitions.add')}
          </button>
          {productDefinitions.map((productDefinition) => (
            <ProductDefinitionItem
              key={productDefinition.id}
              productDefinition={productDefinition}
            />
          ))}
        </div>
      </>
    );
  }
}

export default compose(
  withTranslations,
  withRouter,
  query(() => ({
    productDefinitions: [
      (q) => q.findRecords('productDefinition'),
      buildOptions({
        include: ['type', 'workflow', 'rebuild-workflow', 'republish-workflow'],
      }),
    ],
  })),
  withLoader(({ productDefinitions }) => !productDefinitions),
  withProps(({ productDefinitions }) => ({
    productDefinitions: productDefinitions.sort(
      compareVia((org) => attributesFor(org).name.toLowerCase())
    ),
  }))
)(ListProductDefinition);

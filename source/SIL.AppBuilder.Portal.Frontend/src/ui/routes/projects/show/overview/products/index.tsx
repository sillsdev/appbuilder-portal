import * as React from 'react';
import * as toast from '@lib/toast';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { isEmpty } from '@lib/collection';

import {
  ProjectResource,
  ProductResource,
  withLoader,
  ProductDefinitionResource,
  OrganizationResource,
  attributesFor,
} from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';

import ProductSelectionManager from './selection-manager';
import ProductItem from './item';

import './styles.scss';

interface INeededProps {
  project: ProjectResource;
}

interface IOwnProps {
  products: ProductResource[];
  organization: OrganizationResource;
  isEmptyWorkflowProjectUrl: boolean;
}

type IProps = IOwnProps & i18nProps & INeededProps;

class Products extends React.Component<IProps> {
  render() {
    const { t, products, organization, isEmptyWorkflowProjectUrl, project } = this.props;

    let productList;

    if (isEmpty(products)) {
      productList = (
        <div
          className='flex align-items-center justify-content-center
          m-b-lg p-t-md p-b-md round-border-8 thin-border'
        >
          <span data-test-project-product-empty-text>{t('project.products.empty')}</span>
        </div>
      );
    } else {
      productList = products.map((product, i) => <ProductItem key={i} product={product} />);
    }

    return (
      <div data-test-project-products className='product p-t-lg p-b-xl m-b-lg thin-bottom-border'>
        <h3 className='m-b-sm fs-21'>{t('project.products.title')}</h3>
        <p className='italic m-b-md'>{t('products.definition')}</p>

        {!isEmpty(products) && (
          <div className='flex align-items-center fs-13 bold gray-text m-b-sm d-xs-only-none d-sm-only-none'>
            <div className='w-55' />
            <div className='w-20 item-title'>{t('project.products.updated')}</div>
            <div className='w-20 item-title'>{t('project.products.published')}</div>
            <div className='w-5' />
          </div>
        )}
        <div className='m-b-lg'>{productList}</div>
        <ProductSelectionManager
          organization={organization}
          selected={products}
          project={project}
        />
      </div>
    );
  }
}
export default compose<IProps, INeededProps>(
  withTranslations,
  withOrbit(({ project }) => ({
    organization: (q) => q.findRelatedRecord(project, 'organization'),
    products: (q) => q.findRelatedRecords(project, 'products'),
  })),
  withLoader(({ products }) => !products)
)(Products);

import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { isEmpty } from '@lib/collection';
import {
  ProjectResource,
  ProductResource,
  withLoader,
  ProductDefinitionResource,
  OrganizationResource
} from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import ProductModal from './modal';
import ProductItem from './item';
import {
  withDataActions,
  IProvidedProps as IDataActionsProps
} from '@data/containers/resources/project/with-data-actions';

import './styles.scss';

interface IOwnProps {
  project: ProjectResource;
  products: ProductResource[];
  organization: OrganizationResource;
}

type IProps =
  & IOwnProps
  & i18nProps
  & IDataActionsProps;

const mapRecordsToProps = (passedProps) => {
  const { project } = passedProps;

  return {
    organization: q => q.findRelatedRecord(project, 'organization'),
    products: q => q.findRelatedRecords(project, 'products')
  };
};

class Products extends React.Component<IProps> {

  onSelectionChange = async (item: ProductDefinitionResource) => {

    const { t, updateProduct } = this.props;
    try {
      await updateProduct(item);
      toast.success(t('updated'));
    } catch (e) {
      toast.error(e.message);
    }
  }

  render() {

    const { t, products, organization } = this.props;

    const productModalProps = {
      organization,
      selected: products,
      onSelectionChange: this.onSelectionChange
    };

    let productList;

    if (isEmpty(products)) {
      productList = (
        <div className='empty-products flex align-items-center justify-content-center'>
          <span data-test-project-product-empty-text>
            {t('project.products.empty')}
          </span>
        </div>
      );
    } else {
      productList = products.map((product, i) =>
        <ProductItem key={i} product={product} includeHeader={i === 0} />
      );
    }

    return (
      <div data-test-project-products className='product'>
        <h3 className='m-b-md'>{t('project.products.title')}</h3>
        <div className='m-b-lg'>
          {productList}
        </div>
        <ProductModal {...productModalProps} />
      </div>
    );

  }

}

export default compose(
  withTranslations,
  withOrbit(mapRecordsToProps),
  withLoader(({products}) => !products),
  withDataActions
)(Products);
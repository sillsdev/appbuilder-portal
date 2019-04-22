import * as React from 'react';
import { withOrbit as withSubscribedUpdates, useOrbit, idFromRecordIdentity } from 'react-orbitjs';
import { isEmpty } from '@lib/collection';

import { ProjectResource, ProductResource, OrganizationResource } from '@data';

import { useTranslations } from '@lib/i18n';

import ProductSelectionManager from './selection-manager';
import ProductItem from './item';

import './styles.scss';
import { useLiveData } from '~/data/live';

import { useConditionalPoll } from '~/lib/hooks';

interface IProps {
  project: ProjectResource;
  isEmptyWorkflowProjectUrl: boolean;
}

interface ISubscriptions {
  products: ProductResource[];
  organization: OrganizationResource;
}

export default function Products({ project }: IProps) {
  const { t } = useTranslations();
  const {
    dataStore,
    subscriptions: { products, organization, userTasks },
  } = useOrbit<ISubscriptions>({
    products: (q) => q.findRelatedRecords(project, 'products'),
    organization: (q) => q.findRelatedRecord(project, 'organization'),
    // cache busters
    userTasks: (q) => q.findRecords('userTask'),
    project: (q) => q.findRecord(project),
  });

  useLiveData(`projects/${idFromRecordIdentity(dataStore, project)}`);
  useLiveData(`products`);
  useLiveData(`user-tasks`);

  // useConditionalPoll(async () => {
  //   const result = await dataStore.cache.query((q) => q.findRelatedRecords(project, 'products'));

  //   return ( result || [] ).length > 0;
  // }, 3000);

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
    productList = products.map((product) => <ProductItem key={product.id} product={product} />);
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

      <ProductSelectionManager organization={organization} selected={products} project={project} />
    </div>
  );
}

import * as React from 'react';
import { useOrbit } from 'react-orbitjs';

import { ProductResource, ProductDefinitionResource, attributesFor, TaskResource } from '@data';

import StoreIcon from '@material-ui/icons/StoreTwoTone';
import ProductIcon from '@ui/components/product-icon';
import ProductLink from '@ui/components/product-link';
import TimezoneLabel from '@ui/components/labels/timezone';
import { isEmpty } from '@lib/collection';
import { useTranslations } from '@lib/i18n';

import ItemActions from '~/ui/components/product-artifact/actions';

import ProductTasksForCurrentUser from './tasks';

interface IOwnProps {
  includeHeader?: boolean;
  product: ProductResource;
  productDefinition: ProductDefinitionResource;
  tasks: TaskResource[];
}

type IProps = IOwnProps;

export default function ProductItem({ product, includeHeader }) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();

  const productDefinition = dataStore.cache.query((q) =>
    q.findRelatedRecord(product, 'productDefinition')
  );

  const { name } = attributesFor(productDefinition);
  const { dateUpdated, datePublished, publishLink } = attributesFor(product);
  return (
    <div data-test-project-product-item className='round-border-4 thin-border'>
      <div
        className='
        flex-md flex-100 position-relative
        justify-content-space-between align-items-center
        w-100-xs-only
        p-md fs-13 light-gray-text
        bg-lightest-gray round-border-4 thin-bottom-border
        '
      >
        <div className='flex align-items-center w-55-md'>
          <ProductIcon product={productDefinition} selected={true} />
          <div data-test-project-product-name className='m-l-sm fs-16 bold blue-highlight'>
            {name}
          </div>
          {!isEmpty(publishLink) && (
            <div data-test-project-product-publishlink>
              <a className='m-l-sm' href={publishLink} target='_blank' rel='noopener noreferrer'>
                <StoreIcon />
              </a>
              <ProductLink product={product} name={name} />
            </div>
          )}
        </div>
        <div className='w-20-md p-l-xs-md'>
          <span className='d-md-none m-r-sm bold'>{t('project.products.updated')}:</span>
          <TimezoneLabel dateTime={dateUpdated} emptyLabel='--' />
        </div>
        <div className='p-l-sm-md w-20-md'>
          <span className='d-md-none m-r-sm bold'>{t('project.products.published')}:</span>
          <TimezoneLabel dateTime={datePublished} emptyLabel='--' />
        </div>
        <div className='flex w-5-md p-l-md-md move-right'>
          <ItemActions product={product} />
        </div>
      </div>

      <ProductTasksForCurrentUser {...{ product }} />
    </div>
  );
}

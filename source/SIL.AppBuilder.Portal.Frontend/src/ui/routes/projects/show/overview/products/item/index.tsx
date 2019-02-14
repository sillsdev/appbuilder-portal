import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit, useOrbit } from 'react-orbitjs';

import {
  ProductResource,
  ProductDefinitionResource,
  withLoader,
  attributesFor,
  UserTaskResource,
} from '@data';

import IconButton from '@material-ui/core/IconButton';
import LaunchIcon from '@material-ui/icons/Launch';
import ProductIcon from '@ui/components/product-icon';
import TimezoneLabel from '@ui/components/labels/timezone';
import { Link } from 'react-router-dom';
import { isEmpty } from '@lib/collection';
import { useTranslations } from '@lib/i18n';

import ItemActions from './actions';
import { useCurrentUser } from '~/data/containers/with-current-user';

interface IOwnProps {
  includeHeader?: boolean;
  product: ProductResource;
  productDefinition: ProductDefinitionResource;
  tasks: UserTaskResource[];
}

type IProps = IOwnProps;

export default function ProductItem({ product, includeHeader }) {
  const { t } = useTranslations();
  const { currentUser } = useCurrentUser();
  const { dataStore } = useOrbit();

  const productDefinition = dataStore.cache.query((q) =>
    q.findRelatedRecord(product, 'productDefinition')
  );

  const tasks = dataStore.cache.query((q) =>
    q
      .findRecords('userTasks')
      .filter({ relation: 'product', record: product })
      .filter({ relation: 'user', record: currentUser })
  );

  const { description, name } = attributesFor(productDefinition);
  const { dateUpdated, datePublished, publishLink } = attributesFor(product);

  return (
    <div
      className='flex-md w-100-xs-only
        flex-100 m-b-sm position-relative
        justify-content-space-between
        align-items-center
        p-md fs-13 light-gray-text
        round-border-4 thin-border'
      data-test-project-product-item
    >
      <div className='flex align-items-center w-55-md'>
        <ProductIcon product={productDefinition} selected={true} />
        <div data-test-project-product-name className='m-l-sm fs-16 bold blue-highlight'>
          {name}
        </div>
        {!isEmpty(publishLink) && (
          <div data-test-project-product-publishlink>
            <IconButton component={Link} to={publishLink} target='_blank'>
              <LaunchIcon />
            </IconButton>
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
        <ItemActions />
      </div>

      {(tasks || []).map((task) => {
        const { activityName } = attributesFor(task);
        return activityName;
      })}
    </div>
  );
}

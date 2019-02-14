import React from 'react';
import { compose, withProps } from 'recompose';

import { query, withLoader, attributesFor, StoreResource, buildOptions } from '@data';

import { useTranslations } from '@lib/i18n';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { paths } from '@ui/routes/admin/paths';
import { compareVia } from '@lib/collection';

import Item from './item';

interface IProps {
  stores: StoreResource[];
  navigateToCreate: () => void;
}

type IComposedProps = {
  stores: StoreResource[];
} & RouteComponentProps;

function ListStores({ stores, navigateToCreate }: IProps) {
  const { t } = useTranslations();

  return (
    <>
      <h2 className='sub-page-heading'>{t('stores.listTitle')}</h2>
      <div className='m-b-xxl'>
        <a className='ui button tertiary uppercase large m-b-lg' onClick={navigateToCreate}>
          {t('models.add', { name: t('stores.name') })}
        </a>

        {stores.map((store) => (
          <Item key={store.id} store={store} />
        ))}
      </div>
    </>
  );
}

export default compose(
  withRouter,
  query(() => ({
    stores: [(q) => q.findRecords('store'), buildOptions({ include: ['store-type'] })],
  })),
  withLoader(({ stores }) => !stores),
  withProps(({ stores, history }: IComposedProps & RouteComponentProps) => ({
    stores: stores.sort(
      compareVia((store: StoreResource) => attributesFor(store).name.toLowerCase())
    ),
    navigateToCreate(e: React.MouseEvent) {
      e.preventDefault();

      history.push(paths.settings.stores.create.path());
    },
  }))
)(ListStores);

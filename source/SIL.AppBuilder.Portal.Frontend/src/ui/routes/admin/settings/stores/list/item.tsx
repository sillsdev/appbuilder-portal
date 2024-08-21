import * as React from 'react';
import CreateIcon from '@material-ui/icons/Create';
import { Link } from 'react-router-dom';
import { idFromRecordIdentity, useOrbit, attributesFor } from 'react-orbitjs';
import { StoreResource } from '@data';
import { useTranslations } from '@lib/i18n';
import { paths } from '@ui/routes/admin/paths';

interface IProps {
  store: StoreResource;
}

export default function Item({ store }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const { name, description } = attributesFor(store);
  const storeType = dataStore.cache.query((q) => q.findRelatedRecord(store, 'storeType'));
  const { name: storeTypeName } = attributesFor(storeType);

  return (
    <div className='flex p-md fs-13 m-b-sm thin-border round-border-4'>
      <div className='flex-grow'>
        <div className='bold fs-16'>{name}</div>

        <div className='p-t-md'>
          <span className='bold m-r-sm'>{t('stores.attributes.description')}:</span>
          <span>{description}</span>
        </div>

        <div className='p-t-md'>
          <span className='bold m-r-sm'>{t('storeTypes.name')}:</span>
          <span>{storeTypeName}</span>
        </div>
      </div>

      <div>
        <Link
          className='gray-text'
          to={paths.settings.stores.edit.path(idFromRecordIdentity(dataStore, store))}
        >
          <CreateIcon className='fs-16' />
        </Link>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { withValue } from 'react-state-helpers';
import { attributesFor, useOrbit, useQuery } from 'react-orbitjs';
import { Dropdown } from 'semantic-ui-react';
import { isEmpty, hasValues } from '@lib/collection';
import { useTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';

import { buildOptions } from '~/data';

function getStoreType(dataStore, store) {
  if (!store) return;

  return dataStore.cache.query((q) => q.findRelatedRecord(store, 'storeType'));
}

export default function StoreForm({ save, cancel, store }) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();

  const {
    result: { storeTypes },
  } = useQuery({ storeTypes: [(q) => q.findRecords('storeType'), buildOptions()] });

  const attributes = attributesFor(store || {});
  const isEditing = !!store;

  const existingStoreType = useMemo(() => getStoreType(dataStore, store), [dataStore, store]);

  // Form States
  const [name, setName] = useState(attributes.name || '');
  const [storeType, setStoreType] = useState(existingStoreType);
  const [description, setDescription] = useState(attributes.description || '');
  const [errors, setError] = useState<IMap<string>>({});
  // End Form States

  const onSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let newErrors = {
      name: isEmpty(name) && t('errors.requiredField', { field: t('stores.attributes.name') }),
    };

    setError(newErrors);
    const isValid = !hasValues(Object.values(newErrors));

    if (isValid) {
      try {
        await save({ name, description }, { storeType });
      } catch (e) {
        toast.error(e);
      }
    }
  };

  return (
    <>
      <h2>{t(`models.${isEditing ? 'edit' : 'add'}`, { name: t('stores.name') })}</h2>
      <div className='flex w-60'>
        <form data-test-st-form className='ui form flex-grow'>
          <div className='field m-b-xl'>
            <label>{t('stores.attributes.name')}</label>
            <input
              required
              data-test-st-name
              type='text'
              value={name}
              onChange={withValue(setName)}
            />
            <div className='error'>{errors.name}</div>
          </div>

          <div className='field m-b-xl'>
            <label>{t('stores.attributes.description')}</label>
            <input
              data-test-st-description
              type='text'
              value={description}
              onChange={withValue(setDescription)}
            />
          </div>

          <div className='field m-b-xl'>
            <label>{t('storeTypes.name')}</label>
            <div className='w-100 thin-bottom-border'>
              <Dropdown
                className='custom w-100 no-borders p-sm'
                data-test-store-type
                text={attributesFor(storeType || {}).name}
              >
                <Dropdown.Menu>
                  {(storeTypes || []).map((storeType) => {
                    const { name: storeName } = attributesFor(storeType);

                    return (
                      <Dropdown.Item
                        key={storeType.id}
                        text={storeName}
                        onClick={() => setStoreType(storeType)}
                      />
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className='error'>{errors.storeType}</div>
          </div>

          <div className='m-b-xl'>
            <button
              data-test-submit
              className='ui button p-t-md p-b-md p-l-lg p-r-lg'
              onClick={onSubmit}
            >
              {isEditing ? t('common.save') : t('common.add')}
            </button>

            <button
              data-test-cancel
              className='ui button p-t-md p-b-md p-l-lg p-r-lg'
              onClick={cancel}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

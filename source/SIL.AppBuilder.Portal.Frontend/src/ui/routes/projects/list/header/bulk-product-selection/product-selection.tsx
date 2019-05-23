import React, { useCallback, useEffect } from 'react';
import { useRedux } from 'use-redux';

import { rowSelectionsFor } from '~/redux-store/data/selectors';

import { ProjectResource, ProductDefinitionResource } from '~/data';

import { useOrbit, attributesFor, idFromRecordIdentity } from 'react-orbitjs';
import Store from '@orbit/store';
import { Checkbox } from 'semantic-ui-react';
import ProductIcon from '@ui/components/product-icon';

import { AsyncWaiter } from '~/data/async-waiter';

import { post as authenticatedPost, tryParseJson } from '~/lib/fetch';

import { useSelectionManager } from './selection-reducer';

import { ErrorBoundary, ErrorMessage } from '~/ui/components/errors';

import { GenericJsonApiError } from '~/data/errors/generic-jsonapi-error';

import { useTranslations } from '~/lib/i18n';

import { compareVia } from '~/lib/collection';

interface Permissions {
  [permissionName: string]: string[];
}

interface IProps {
  tableName: string;
  onChange: (ids: string[]) => void;
  onPermissionRetrieval: (newPermissions: Permissions) => void;
}

export function ProductSelection({ tableName, onChange, onPermissionRetrieval }: IProps) {
  const { t } = useTranslations();
  const [reduxState] = useRedux();
  const { dataStore } = useOrbit();
  const { isSelected, toggle, selected } = useSelectionManager();
  const selectedRows: ProjectResource[] = rowSelectionsFor(reduxState, tableName);
  const knownProductDefinitions = dataStore.cache.query((q) => q.findRecords('productDefinition'));
  const productDefinitions = knownProductDefinitions.sort(compareVia((a) => attributesFor(a).name));

  const getPermissions = uesPermissions(selectedRows, dataStore, onPermissionRetrieval);

  useProductSelection(selectedRows, dataStore, selected, onChange);

  return (
    <ErrorBoundary size='small'>
      <AsyncWaiter fn={getPermissions}>
        {({ value }) => {
          if (!value || Object.keys(value).length === 0) {
            return <ErrorMessage error={t('errors.friendlyForbidden')} />;
          }

          return (
            <>
              {productDefinitions.map((productDefinition) => {
                const id = productDefinition.id;
                const { name, description } = attributesFor(productDefinition);
                const isProductSelected = isSelected(id);

                return (
                  <div
                    key={productDefinition.id}
                    className={`flex flex-column align-items-center
                              w-100 m-b-sm round-border-4 light-gray-text pointer
                              ${isProductSelected ? 'blue-light-border' : 'thin-border'}`}
                    data-test-item
                    onClick={() => toggle(id)}
                  >
                    <div
                      className={`flex flex-row align-items-center
                                w-100 p-sm bg-lightest-gray fs-14 round-border-4
                                ${
                                  isProductSelected
                                    ? 'blue-light-bottom-border'
                                    : 'thin-bottom-border'
                                }`}
                    >
                      <Checkbox
                        data-test-item-checkbox
                        className='m-r-sm'
                        value={id}
                        checked={isProductSelected}
                      />
                      <ProductIcon
                        product={productDefinition}
                        selected={isProductSelected}
                        size={19}
                      />
                      <span
                        data-test-item-text
                        className={`p-l-xs-xs ${isSelected && 'black-text'}`}
                      >
                        {name}
                      </span>
                    </div>
                    <div className='w-100 p-sm p-t-md p-b-md fs-11'>
                      <span>{description}</span>
                    </div>
                  </div>
                );
              })}
            </>
          );
        }}
      </AsyncWaiter>
    </ErrorBoundary>
  );
}

interface IAllowedBulkList {
  productDefinition: ProductDefinitionResource;
  isAllowed: boolean;
}

function useProductSelection(
  selectedRows: ProjectResource[],
  dataStore: Store,
  selected: any,
  onChange: (ids: string[]) => void
) {
  useEffect(() => {
    // given the selected projects, find the products that also have any of the
    // selected product definitions
    let products = [];

    selectedRows.forEach((project) => {
      const projectProducts = dataStore.cache
        .query((q) => q.findRelatedRecords(project, 'products'))
        .filter((product) => {
          const productDefinition = dataStore.cache.query((q) =>
            q.findRelatedRecord(product, 'productDefinition')
          );
          // this comparison is using local ids-
          return selected.includes(productDefinition.id);
        });

      products = products.concat(projectProducts);
    });

    // remote ids
    const productIds = products.map((product) => idFromRecordIdentity(dataStore, product));

    onChange(productIds);
  }, [dataStore, onChange, selected, selectedRows]);
}

function uesPermissions(
  selectedRows: ProjectResource[],
  dataStore: Store,
  onPermissionRetrieval: (newPermissions: Permissions) => void
) {
  return useCallback(async () => {
    const ids = selectedRows.map((project) => idFromRecordIdentity(dataStore, project));
    const response = await authenticatedPost(`/api/product-actions`, {
      data: { projects: ids },
      headers: {
        ['Content-Type']: 'application/json',
      },
    });

    if (response.status >= 400) {
      const json = await tryParseJson(response);
      throw new GenericJsonApiError(response.status, response.statusText, json);
    }

    const json = await response.json();

    onPermissionRetrieval(json);

    return json;
  }, [dataStore, onPermissionRetrieval, selectedRows]);
}

import React, { useCallback, useEffect } from 'react';
import { useRedux } from 'use-redux';
import { rowSelectionsFor } from '~/redux-store/data/selectors';
import { ProjectResource, ProductDefinitionResource } from '~/data';
import { useOrbit, attributesFor } from 'react-orbitjs';
import Store from '@orbit/store';
import { Checkbox } from 'semantic-ui-react';
import ProductIcon from '@ui/components/product-icon';
import { AsyncWaiter } from '~/data/async-waiter';
import { post as authenticatedPost, tryParseJson } from '~/lib/fetch';

import { useSelectionManager } from './selection-reducer';
import { ErrorBoundary } from '~/ui/components/errors';
import { GenericJsonApiError } from '~/data/errors/generic-jsonapi-error';

interface IProps {
  tableName: string;
  onChange: (ids: string[]) => void;
}

export function ProductSelection({ tableName, onChange }: IProps) {
  const [reduxState] = useRedux();
  const { dataStore } = useOrbit();
  const { isSelected, toggle, selected } = useSelectionManager();
  const selectedRows: ProjectResource[] = rowSelectionsFor(reduxState, tableName);
  const stats = buildStatsForProductTypes(dataStore, selectedRows);

  const getPermissions = useCallback(async () => {
    const ids = selectedRows.map((project) => project.id);

    const response = await authenticatedPost(`/api/product-actions`, {
      data: { ids },
      headers: {
        ['Content-Type']: 'application/json',
      },
    });

    if (response.status >= 400) {
      const json = await tryParseJson(response);
      throw new GenericJsonApiError(response.status, response.statusText, json);
    }

    return await response.json();
  }, [selectedRows]);

  useEffect(() => onChange(selected), [selected]);

  return (
    <ErrorBoundary size='small'>
      <AsyncWaiter fn={getPermissions}>
        {({ value }) => {
          return (
            <>
              {stats.map(({ productDefinition, isAllowed }) => {
                const id = productDefinition.id;
                const { name, description } = attributesFor(productDefinition);
                const isProductSelected = isSelected(id);
                const readOnly = !isAllowed;

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
                        value={productDefinition.id}
                        readOnly={readOnly}
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

function buildStatsForProductTypes(
  dataStore: Store,
  projects: ProjectResource[]
): IAllowedBulkList[] {
  const result = [];
  const knownProductDefinitions = dataStore.cache.query((q) => q.findRecords('productDefinition'));

  knownProductDefinitions.forEach((productDefinition) => {
    result.push({
      productDefinition,
      isAllowed: false,
    });
  });

  return result;
}

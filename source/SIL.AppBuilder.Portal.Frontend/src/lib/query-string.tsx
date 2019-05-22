import * as qs from 'querystring';

import * as React from 'react';
import { assert } from '@lib/debug';

import { useRouter } from '~/lib/hooks';

export interface IProvidedQueryParams<TQueryParams = {}> {
  queryParams: TQueryParams;
  updateQueryParams(newParams: object): void;
}
export function useQueryParams() {
  const { location, history } = useRouter();
  // search includes the '?' ...
  let search = location.search;

  if (search[0] === '?') {
    search = search.substr(1);
  }

  const params = qs.parse(search);

  const updateQueryParams = (changedQPs: object) => {
    const newQueryParams = {
      ...params,
      ...changedQPs,
    };

    history.push({
      pathname: location.pathname,
      search: qs.stringify(newQueryParams),
    });
  };
  return { queryParams: params, updateQueryParams };
}
export function withQueryParams(InnerComponent) {
  return (props) => {
    const { queryParams, updateQueryParams } = useQueryParams();
    return (
      <InnerComponent {...props} queryParams={queryParams} updateQueryParams={updateQueryParams} />
    );
  };
}

withQueryParams.displayName = 'WithQueryParams';

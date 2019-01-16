import * as qs from 'querystring';

import * as React from 'react';
import { assert } from '@lib/debug';

export interface IProvidedQueryParams<TQueryParams = {}> {
  queryParams: TQueryParams;
  updateQueryParams(newParams: object): void;
}

export function withQueryParams(InnerComponent) {
  return (props) => {
    const { location, history } = props;

    assert(location, `location could not be found in props. Did you include withRouter?`);

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

    return <InnerComponent {...props} queryParams={params} updateQueryParams={updateQueryParams} />;
  };
}

withQueryParams.displayName = 'WithQueryParams';

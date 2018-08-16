import * as React from 'react';
import * as qs from 'querystring';

import { assert } from '@lib/debug';

export interface IProvidedQueryParams {
  queryParams: object;
}

export function withQueryParams(InnerComponent) {
  return props => {
    const { location } = props;

    assert(location, `location could not be found in props. Did you include withRouter?`);

    // search includes the '?' ...
    let search = location.search;

    if (search[0] === '?') {
      search = search.substr(1);
    }

    const params = qs.parse(search);

    return <InnerComponent { ...props } queryParams={params} />;
  };
}

withQueryParams.displayName = 'WithQueryParams';

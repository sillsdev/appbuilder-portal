import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { query, defaultSourceOptions } from '@data';

import { TYPE_NAME as PROJECT } from '@data/models/project';
import { PLURAL_NAME as PRODUCTS } from '@data/models/product';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';

const mapNetworkToProps = (passedProps) => {
  const { match } = passedProps;
  const { params: { id } } = match;

  return {
    cacheKey: `project-${id}`,
    project: [q => q.findRecord({ id, type: PROJECT }), {
      label: 'Find Project',
      sources: {
        remote: {
          settings: { ...defaultSourceOptions() },
          include: [PRODUCTS, ORGANIZATION]
        }
      }
    }]
  };
};

export function withData(WrappedComponent) {
  return compose(
    query(mapNetworkToProps),
  )(WrappedComponent);
}

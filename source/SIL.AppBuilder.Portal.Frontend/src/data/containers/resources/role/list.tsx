import { compose } from 'recompose';

import { query, buildOptions, RoleResource } from '@data';

export interface IProvidedProps {
  roles: RoleResource[];
  error?: any;
}

interface IOptions {
  include?: string;
}

export function withNetwork<TWrappedProps>(options: IOptions = {}) {
  const { include } = options;

  return WrappedComponent => {
    function mapNetworkToProps(passedProps: TWrappedProps) {
      let requestOptions = {};

      if (include) {
        requestOptions = buildOptions({ include: [include] });
      } else {
        requestOptions = buildOptions();
      }

      return {
        roles: [
          q => q.findRecords('role'),
          requestOptions
        ]
      };
    }

    return compose(
      query(mapNetworkToProps, { passthroughError: true, useRemoteDirectly: true }),
    )(WrappedComponent);
  };
}

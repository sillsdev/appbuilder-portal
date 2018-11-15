import { compose } from 'recompose';

import { query, buildOptions, UserTaskResource } from '@data';

interface IOptions {
  include?: string;
}

export interface IProvidedProps {
  userTasks: UserTaskResource[];
  isLoading: boolean;
  error?: any;
}

type IProps =
& {}

export function withNetwork<TWRappedProps>(options: IOptions = {}) {
  const { include } = options;

  return WrappedComponent => {
    function mapNetworkToProps(passedProps: TWRappedProps & IProps) {
      const {

      } = passedProps;

      const requestOptions = buildOptions({
        include: [
          'product.project',
          'product.product-definition.workflow'
        ]
      });

      return {
        cacheKey: ['static'],
        userTasks: [
          q => {
            let builder = q.findRecords('userTask');

            return builder;
          },
          requestOptions
        ]
      }
    }

    return compose(
      query(mapNetworkToProps, { passthroughError: true, useRemoteDirectly: true }),
    )(WrappedComponent);
  };
}

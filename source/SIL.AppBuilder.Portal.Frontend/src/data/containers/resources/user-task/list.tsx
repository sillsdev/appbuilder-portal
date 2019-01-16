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

interface IProps {}

const defaultInclude = ['product.project', 'product.product-definition.workflow'];

export function withNetwork<TWRappedProps>(options: IOptions = {}) {
  const { include } = options;

  return (WrappedComponent) => {
    function mapNetworkToProps(passedProps: TWRappedProps & IProps) {
      const requestOptions = buildOptions({
        include: include || defaultInclude,
      });

      return {
        cacheKey: ['static', include],
        userTasks: [
          (q) => {
            const builder = q.findRecords('userTask');

            return builder;
          },
          requestOptions,
        ],
      };
    }

    return compose(
      query(mapNetworkToProps, {
        passthroughError: true,
        useRemoteDirectly: true,
      })
    )(WrappedComponent);
  };
}

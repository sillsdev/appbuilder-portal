import { compose } from 'recompose';

import { query, buildOptions, UserResource } from '@data';

import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { IPaginateProps } from '@data/containers/api/pagination';
import { ISortProps } from '@data/containers/api/sorting';
import { IProvidedProps as IOrgProps } from '@data/containers/with-current-organization';

export interface IProvidedProps {
  users: UserResource[];
  isLoading: boolean;
  error?: any;
}

interface IOptions {
  include?: string;
}

type IProps = IFilterProps & IPaginateProps & IOrgProps & ISortProps;

export function withNetwork<TWrappedProps>(options: IOptions = {}) {
  const { include } = options;

  return (WrappedComponent) => {
    function mapNetworkToProps(passedProps: TWrappedProps & IProps) {
      const {
        applyPagination,
        currentPageOffset,
        currentPageSize,
        applyFilter,
        filters,
        sortProperty,
        currentOrganizationId,
        applySort,
      } = passedProps;

      const requestOptions = buildOptions({
        include: [include],
      });

      return {
        cacheKey: [
          currentOrganizationId,
          sortProperty,
          filters,
          currentPageOffset,
          currentPageSize,
        ],
        users: [
          (q) => {
            let builder = q.findRecords('user');

            if (applyFilter) {
              builder = applyFilter(builder);
            }

            if (applyPagination) {
              builder = applyPagination(builder);
            }

            if (applySort) {
              builder = applySort(builder);
            }

            return builder;
          },
          requestOptions,
        ],
      };
    }

    return compose(query(mapNetworkToProps, { passthroughError: true, useRemoteDirectly: true }))(
      WrappedComponent
    );
  };
}

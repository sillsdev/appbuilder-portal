import { query, buildOptions, OrganizationStoreResource } from '@data';

import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { IPaginateProps } from '@data/containers/api/pagination';
import { ISortProps } from '@data/containers/api/sorting';
import { IProvidedProps as IOrgProps } from '@data/containers/with-current-organization';

export interface INeededProps {}

export interface IProvidedProps {
  organizationStores: OrganizationStoreResource[];
  error?: any;
}

type IProps = IFilterProps & IPaginateProps & IOrgProps & ISortProps;

export function withNetwork<TWrappedProps>() {
  return (WrappedComponent) => {
    function mapNetworkToProps(passedProps: TWrappedProps & IProps & INeededProps) {
      const {
        applyPagination,
        currentPageOffset,
        currentPageSize,
        applyFilter,
        filters,
        sortProperty,
        applySort,
      } = passedProps;

      const requestOptions = buildOptions({
        include: ['store.store-type'],
      });

      return {
        cacheKey: [sortProperty, filters, currentPageOffset, currentPageSize],
        organizationStores: [
          (q) => {
            let builder = q.findRecords('organizationStore');

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

    return query(mapNetworkToProps, { passthroughError: true, useRemoteDirectly: true })(
      WrappedComponent
    );
  };
}

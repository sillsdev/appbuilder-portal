import { compose } from 'recompose';

import { query, buildOptions, ProductDefinitionResource } from '@data';

import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { IPaginateProps } from '@data/containers/api/pagination';
import { ISortProps } from '@data/containers/api/sorting';
import { IProvidedProps as IOrgProps, withCurrentOrganization } from '@data/containers/with-current-organization';

export interface IOwnProps {
  productDefinitions: ProductDefinitionResource;
  error?: any;
}

type IProps =
& IFilterProps
& IPaginateProps
& IOrgProps
& ISortProps;

export function withNetwork<TWrappedProps>(options = {}) {
  return WrappedComponent => {
    function mapNetworkToProps(passedProps: TWrappedProps & IProps) {
      const {
        applyPagination, currentPageOffset, currentPageSize,
        applyFilter, filters, sortProperty, currentOrganization,
        applySort,
      } = passedProps;

      const requestOptions = buildOptions({
        include: ['product-definition']
      });

      return {
        cacheKey: [
          sortProperty, filters,
          currentPageOffset, currentPageSize
        ],
        organizationProductDefinitions: [
          q => {
            let builder = q.findRelatedRecords(currentOrganization,'organizationProductDefinitions');

            if (applyFilter) { builder = applyFilter(builder); }
            if (applyPagination) { builder = applyPagination(builder); }
            if (applySort) { builder = applySort(builder); }

            return builder;
          },
          requestOptions
        ]
      };
    }

    return compose(
      withCurrentOrganization,
      query(mapNetworkToProps, { passthroughError: true, useRemoteDirectly: true }),
    )(WrappedComponent);
  };
}

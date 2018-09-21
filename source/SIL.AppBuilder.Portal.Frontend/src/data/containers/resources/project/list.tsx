import { compose } from 'recompose';

import { buildOptions } from '@data';
import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { TYPE_NAME as PROJECT, ProjectAttributes } from '@data/models/project';
import { IPaginateProps } from '@data/containers/api/pagination';
import { ISortProps } from '@data/containers/api/sorting';

import { query, PROJECTS_TYPE } from '@data';

import { ResourceObject } from 'jsonapi-typescript';

export interface IOwnProps {
  projects: Array<ResourceObject<PROJECTS_TYPE, ProjectAttributes>>;
  error?: any;
}

interface IOptions {
  organizationHeader?: string;
}

type IProps =
& IFilterProps
& IPaginateProps
& ISortProps;

export function withNetwork<TWrappedProps>(options: IOptions = {}) {
  const { organizationHeader } = options;

  const isUsingSpecifiedOrgHeader = (
    organizationHeader !== null &&
    organizationHeader !== undefined
  );


  return WrappedComponent => {
    function mapNetworkToProps(passedProps: TWrappedProps & IProps) {
      const {
        applyPagination, currentPageOffset, currentPageSize,
        applyFilter, filters,
        applySort,
      } = passedProps;

      const requestOptions = buildOptions({
        include: ['organization,group,owner']
      });

      if (isUsingSpecifiedOrgHeader) {
        requestOptions.sources.remote.settings.headers.Organization = organizationHeader;
      }

      return {
        cacheKey: [filters, currentPageOffset, currentPageSize],
        projects: [
          q => {
            let builder = q.findRecords(PROJECT);

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
      query(mapNetworkToProps, { passthroughError: true, useRemoteDirectly: true }),
    )(WrappedComponent);
  };
}

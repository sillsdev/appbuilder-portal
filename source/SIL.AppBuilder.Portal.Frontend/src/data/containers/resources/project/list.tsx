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
  all?: boolean;
}

type IProps =
& IFilterProps
& IPaginateProps
& ISortProps;

export function withNetwork<TWrappedProps>(options: IOptions = {}) {
  const { all } = options;

  const isWantingAllProjects = all === true;

  return WrappedComponent => {
    function mapNetworkToProps(passedProps: TWrappedProps & IProps) {
      const {
        applyPagination, currentPageOffset, currentPageSize,
        applyFilter, filters,
        applySort,
      } = passedProps;

      const requestOptions = buildOptions({
        include: ['organization,group,owner,products.product-definition']
      });

      if (isWantingAllProjects) {
        delete requestOptions.sources.remote.settings.headers.Organization;
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

import { compose } from 'recompose';

import { buildOptions, ProjectResource } from '@data';

import { IProvidedProps as IFilterProps } from '@data/containers/api/with-filtering';
import { TYPE_NAME as PROJECT } from '@data/models/project';
import { IPaginateProps } from '@data/containers/api/pagination';
import { ISortProps } from '@data/containers/api/sorting';
import { IProvidedProps as IOrgProps } from '@data/containers/with-current-organization';

import { query } from '@data';

import { roleInOrganizationOfResource } from '@data/containers/with-role';

import { attributesFor } from '~/data/helpers';

import { idFromRecordIdentity } from '~/data/store-helpers';

import { ROLE } from '@models/role';
export interface IOwnProps {
  projects: ProjectResource[];
  isLoading: boolean;
  error?: any;
}

interface IOptions {
  all?: boolean;
}

type IProps = IFilterProps & IPaginateProps & IOrgProps & ISortProps;

export function withNetwork<TWrappedProps>(options: IOptions = {}) {
  const { all } = options;

  const isWantingAllProjects = all === true;

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
        include: [
          'organization',
          'group',
          'owner',
          'products.product-definition.type',
          'products.product-definition.rebuild-workflow',
          'products.product-definition.republish-workflow',
        ],
      });

      if (isWantingAllProjects) {
        delete requestOptions.sources.remote.settings.headers.Organization;
      }

      return {
        cacheKey: [
          currentOrganizationId,
          sortProperty,
          filters,
          currentPageOffset,
          currentPageSize,
        ],
        projects: [
          (q) => {
            let builder = q.findRecords(PROJECT);

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

    async function mapResultsFn(props, result) {
      const { dataStore, currentUser } = props;
      const { projects } = result;

      if (projects && projects.length === 0) {
        return result;
      }

      const currentUserId = parseInt(idFromRecordIdentity(currentUser), 10);
      const promises = projects.map((p) => {
        const projectOwnerId = parseInt(attributesFor(p).ownerId, 10);
        const isOwner = projectOwnerId === currentUserId;

        if (isOwner) {
          return Promise.resolve(isOwner);
        }

        return roleInOrganizationOfResource(currentUser, dataStore, p, ROLE.OrganizationAdmin);
      });

      const canArchive = await Promise.all(promises);
      const projectResult = projects.map((p, idx) => {
        p.currentUserCanArchive = canArchive[idx];

        return p;
      });

      return Promise.resolve({ ...result, projects: projectResult });
    }

    return compose(
      query(mapNetworkToProps, {
        passthroughError: true,
        useRemoteDirectly: true,
        mapResultsFn,
      })
    )(WrappedComponent);
  };
}

import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import { ResourceObject } from 'jsonapi-typescript';

import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';

import { OrganizationResource } from '../models/organization';
import { RoleResource, ROLE } from '../models/role';
import { isRelatedTo, attributesFor } from '../helpers';
import { withCurrentUser, IProvidedProps as ICurrentUserProps } from './with-current-user';
import { withCurrentOrganization, IProvidedProps as IOrganziationProps } from './with-current-organization';

export interface IOptions<TWrappedProps> {
  forOrganization?: OrganizationResource;
  errorOnForbidden?: boolean;
  redirectTo?: string;
  componentOnForbidden?: any;
  checkOrganizationOf?: (props: TWrappedProps) => ResourceObject;
  overrideIf?: (props: TWrappedProps) => boolean;
}

export interface IOwnProps {

}

export interface IProvidedProps {
  isForbidden: boolean;
  accessGranted: boolean;
}

export type IProps =
& IOwnProps
& IOrganziationProps
& WithDataProps
& RouteComponentProps
& i18nProps
& ICurrentUserProps;

interface IState {
  accessGranted: boolean;
  roleEvaluated: boolean;
  error?: string;
}

export function withRole<TWrappedProps extends {}>(role: ROLE, givenOptions?: IOptions<TWrappedProps>) {
  const options = {
    ...(givenOptions || {})
  };

  const {
    forOrganization,
    errorOnForbidden,
    redirectTo,
    checkOrganizationOf,
    overrideIf,
    componentOnForbidden: OnForbidden,
    ...extraProps
  } = options;

  return WrappedComponent => {
    class AuthorizationWrapper extends React.PureComponent<TWrappedProps & IProps, IState> {
      state = { roleEvaluated: false, accessGranted: false, error: '' };

      doesUserHaveAccess = async () => {
        if (overrideIf && overrideIf({ ...(this.props as any), ...(extraProps || {}) })) {
          return true;
        }

        const { currentUser, dataStore, currentOrganization } = this.props;
        const organization = forOrganization || currentOrganization;

        let resultOfResource = false;
        let resultOfOrganization = false;

        if (organization) {
          resultOfOrganization = await roleInOrganization(currentUser, dataStore, organization, role);
        }

        if (checkOrganizationOf) {
          const resource = checkOrganizationOf((this.props as any) as TWrappedProps);

          resultOfResource = await roleInOrganizationOfResource(currentUser, dataStore, resource, role);
        }

        return resultOfOrganization || resultOfResource;
      }

      async componentDidMount() {
        try {
          const result = await this.doesUserHaveAccess();

          this.setState({ accessGranted: result, roleEvaluated: true });
        } catch(error) {
          this.setState({ accessGranted: false, roleEvaluated: true, error });
        }
      }

      render() {
        const { t } = this.props;
        const { accessGranted, roleEvaluated, error } = this.state;

        // not sure if this could cause a flicker or not, all the async
        // work here is with local cache, so I don't know if it would cause a stutter
        // on slower devices
        if (!roleEvaluated) { return null; }


        if (!accessGranted) {
          if (OnForbidden) {
            return <OnForbidden { ...this.props } error={error} />;
          }

          if (redirectTo) {
            toast.error(error || t('errors.friendlyForbidden'));

            return <Redirect to={redirectTo} push={true} />;
          }

          if (errorOnForbidden) {
            return error;
          }

          return null;
        }


        const props: TWrappedProps & IProvidedProps = {
          ...(this.props as object),
          accessGranted,
          isForbidden: !accessGranted,
        };

        return <WrappedComponent { ...props } />;
      }
    }

    return compose(
      withTranslations,
      withOrbit({}),
      withRouter,
      withCurrentUser(),
      withCurrentOrganization
    )( AuthorizationWrapper );
  };

}

async function isSuperAdmin(dataStore, userRoles): Promise<boolean> {
  // NOTE: SuperAdmins are cross-organization
  //       the organization relationship doesn't matter.
  const allAssignedRolesPromises = userRoles.map((userRole) => {
    return dataStore.cache.query(q => q.findRelatedRecord(userRole, 'role'));
  });

  const allAssignedRoles: RoleResource[] = await Promise.all(allAssignedRolesPromises) as unknown as RoleResource[];
  const allAssignmentNames = allAssignedRoles.map(r => attributesFor(r).roleName);
  const result = allAssignmentNames.includes(ROLE.SuperAdmin);

  return result;
}

export async function roleInOrganization(currentUser, dataStore, organization, role: ROLE): Promise<boolean> {
  const userRoles = await dataStore.cache.query(q => q.findRelatedRecords(currentUser, 'userRoles'));

  const canDoEverything = await isSuperAdmin(dataStore, userRoles);

  if (canDoEverything) {
    return true;
  }

  const userRolesMatchingOrganization = userRoles.filter(userRole => {
    return isRelatedTo(userRole, 'organization', organization.id);
  });

  const promises = userRolesMatchingOrganization.map(userRole => {
    return dataStore.cache.query(q => q.findRelatedRecord(userRole, 'role'));
  });

  const rolesForOrganization: RoleResource[] = await Promise.all(promises) as unknown as RoleResource[];
  const roleNames = rolesForOrganization.map(r => attributesFor(r).roleName);

  const result = roleNames.includes(role);

  return result;
}

export async function roleInOrganizationOfResource(currentUser, dataStore, resource, role): Promise<boolean> {
  const organization = await dataStore.cache.query(q => q.findRelatedRecord(resource, 'organization'));

  return roleInOrganization(currentUser, dataStore, organization, role);
}


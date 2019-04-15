// NOTE: much of this should probably be deprecated, as
//       @lib/auth/get-permissions is much more ergonomic.

import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, ILegacyProvidedProps } from 'react-orbitjs';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import { ResourceObject } from 'jsonapi-typescript';
import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';
import Store from '@orbit/store';
import { assert } from '@orbit/utils';

import { OrganizationResource } from '../models/organization';
import { UserResource } from '../models/user';
import { RoleResource, ROLE } from '../models/role';
import { isRelatedTo, attributesFor } from '../helpers';
import { UserRoleResource } from '../models/user-role';

import { withCurrentUserContext, ICurrentUserProps } from './with-current-user';
import {
  withCurrentOrganization,
  IProvidedProps as IOrganziationProps,
} from './with-current-organization';

export interface IOptions<TWrappedProps> {
  forOrganization?: MaybeFunction<OrganizationResource, TWrappedProps>;
  forAnyOrganization?: (props: TWrappedProps) => OrganizationResource[];
  errorOnForbidden?: boolean;
  redirectTo?: string;
  componentOnForbidden?: any;
  checkOrganizationOf?: (props: TWrappedProps) => ResourceObject;
  overrideIf?: (props: TWrappedProps) => boolean;
  passthroughOnForbidden?: boolean;
}

export interface IOwnProps {}

export interface IProvidedProps {
  isForbidden: boolean;
  accessGranted: boolean;
}

export type IProps = IOwnProps &
  IOrganziationProps &
  ILegacyProvidedProps &
  RouteComponentProps &
  i18nProps &
  ICurrentUserProps;

interface IState {
  accessGranted: boolean;
  error?: string;
}

export function evalWithProps(maybeFunction, props) {
  if (typeof maybeFunction === 'function') {
    return maybeFunction(props);
  }

  return maybeFunction;
}

export function withRole<TWrappedProps extends {}>(
  role: ROLE,
  givenOptions?: IOptions<TWrappedProps>
) {
  const options = {
    ...(givenOptions || {}),
  };

  const {
    forOrganization,
    errorOnForbidden,
    forAnyOrganization,
    redirectTo,
    checkOrganizationOf,
    overrideIf,
    componentOnForbidden: OnForbidden,
    passthroughOnForbidden,
    ...extraProps
  } = options;

  return (WrappedComponent) => {
    class AuthorizationWrapper extends React.PureComponent<TWrappedProps & IProps, IState> {
      constructor(props) {
        super(props);

        assert(`currentUser is not present in withRole invocation`, props.currentUser);

        const result = this.doesUserHaveAccess();

        this.state = {
          accessGranted: result,
          error: '',
        };
      }

      doesUserHaveAccess = () => {
        if (overrideIf && overrideIf({ ...(this.props as any), ...(extraProps || {}) })) {
          return true;
        }

        const { currentUser, dataStore, currentOrganization } = this.props;
        const organization = evalWithProps(forOrganization, this.props) || currentOrganization;
        const anyOrganization = forAnyOrganization ? forAnyOrganization(this.props as any) : null;

        const resultOfSuperAdmin = isUserASuperAdmin(dataStore, currentUser);

        if (resultOfSuperAdmin) {
          return true;
        }

        let resultOfResource = false;
        let resultOfOrganization = false;
        let resultOfAnyOrganization = false;

        if (anyOrganization) {
          const results = anyOrganization.map((org) => {
            return roleInOrganization(currentUser, dataStore, org, role);
          });

          // only one needs to be true
          resultOfAnyOrganization = results.some((r) => r);
        }

        if (resultOfAnyOrganization) {
          return true;
        }

        if (organization) {
          resultOfOrganization = roleInOrganization(currentUser, dataStore, organization, role);
        }

        if (checkOrganizationOf) {
          const resource = checkOrganizationOf((this.props as any) as TWrappedProps);

          resultOfResource = roleInOrganizationOfResource(currentUser, dataStore, resource, role);
        }

        return resultOfOrganization || resultOfResource;
      };

      componentDidUpdate() {
        this.resolveAccess();
      }

      resolveAccess = () => {
        // The UI should not be in charge of actively denying
        // access if something dynamic causes authorization to be
        // denied
        if (this.state.accessGranted) {
          return;
        }

        try {
          const result = this.doesUserHaveAccess();

          this.setState({ accessGranted: result, error: undefined });
        } catch (error) {
          console.error('check failed', error);
          this.setState({ accessGranted: false, error });
        }
      };

      render() {
        const { t } = this.props;
        const { accessGranted, error } = this.state;

        if (!accessGranted && !passthroughOnForbidden) {
          if (OnForbidden) {
            return <OnForbidden {...this.props} error={error} />;
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
          ...this.props,
          accessGranted,
          isForbidden: !accessGranted,
        };

        return <WrappedComponent {...props} />;
      }
    }

    return compose(
      withTranslations,
      withOrbit({}),
      withRouter,
      withCurrentUserContext,
      withCurrentOrganization
    )(AuthorizationWrapper);
  };
}

export function isUserASuperAdmin(dataStore: Store, user: UserResource) {
  const userRoles = dataStore.cache.query((q) => q.findRelatedRecords(user, 'userRoles'));

  const result = isSuperAdmin(dataStore, userRoles);

  return result;
}

function isSuperAdmin(dataStore: Store, userRoles: UserRoleResource[]): boolean {
  // NOTE: SuperAdmins are cross-organization
  //       the organization relationship doesn't matter.
  const allAssignedRoles: RoleResource[] = userRoles.map((userRole) => {
    return dataStore.cache.query((q) => q.findRelatedRecord(userRole, 'role'));
  });

  const allAssignmentNames = allAssignedRoles.map((r) => attributesFor(r).roleName);
  const result = allAssignmentNames.includes(ROLE.SuperAdmin);

  return result;
}

export function roleInOrganization(
  currentUser: UserResource,
  dataStore: Store,
  organization: OrganizationResource,
  role: ROLE
): boolean {
  const userRoles = dataStore.cache.query((q) => q.findRelatedRecords(currentUser, 'userRoles'));
  const isAuthorized = isSuperAdmin(dataStore, userRoles);

  if (isAuthorized) {
    return true;
  }

  const userRolesMatchingOrganization = userRoles.filter((userRole) => {
    return isRelatedTo(userRole, 'organization', organization.id);
  });

  const rolesForOrganization = userRolesMatchingOrganization.map((userRole) => {
    return dataStore.cache.query((q) => q.findRelatedRecord(userRole, 'role'));
  });

  const roleNames = rolesForOrganization.map((r) => attributesFor(r).roleName);
  const result = roleNames.includes(role);

  return result;
}

export function roleInOrganizationOfResource(
  currentUser: UserResource,
  dataStore: Store,
  resource: any,
  role: ROLE
): boolean {
  const organization = dataStore.cache.query((q) => q.findRelatedRecord(resource, 'organization'));

  return roleInOrganization(currentUser, dataStore, organization, role);
}

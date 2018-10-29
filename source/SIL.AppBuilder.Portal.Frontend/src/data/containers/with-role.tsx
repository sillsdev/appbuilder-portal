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
    componentOnForbidden: OnForbidden
  } = options;

  return WrappedComponent => {
    class AuthorizationWrapper extends React.PureComponent<TWrappedProps & IProps, IState> {
      state = { roleEvaluated: false, accessGranted: false, error: '' };

      doesUserHaveAccess = async () => {
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

      componentDidMount() {
        this.doesUserHaveAccess().then(( result ) => {
          this.setState({ accessGranted: result, roleEvaluated: true });
        }).catch((error: string) => {
          this.setState({ accessGranted: false, roleEvaluated: true, error });
        });
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
            return <OnForbidden error={error} />;
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


export async function roleInOrganization(currentUser, dataStore, organization, role: ROLE): Promise<boolean> {
  const userRoles = await dataStore.cache.query(q => q.findRelatedRecords(currentUser, 'userRoles'));

  const userRolesMatchingOrganization = userRoles.filter(userRole => {
    return isRelatedTo(userRole, 'organization', organization.id);
  });

  const promises = userRolesMatchingOrganization.map(userRole => {
    return dataStore.cache.query(q => q.findRelatedRecord(userRole, 'role'));
  });

  const rolesForOrganization: RoleResource[] = await Promise.all(promises) as unknown as RoleResource[];
  const roleNames = rolesForOrganization.map(r => attributesFor(r).roleName);

  const result = roleNames.includes(role);
  const isSuperAdmin = roleNames.includes(ROLE.SuperAdmin);

  return result || isSuperAdmin;
}

export async function roleInOrganizationOfResource(currentUser, dataStore, resource, role): Promise<boolean> {
  const organization = await dataStore.cache.query(q => q.findRelatedRecord(resource, 'organization'));

  debugger;
  return roleInOrganization(currentUser, dataStore, organization, role);
}


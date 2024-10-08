import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import * as toast from '@lib/toast';
import {
  attributesFor,
  create,
  buildOptions,
  isRelatedRecord,
  UserResource,
  OrganizationResource,
  RoleResource,
  UserRoleResource,
} from '@data';
import { IProvidedProps as ICurrentUserProps } from '@data/containers/with-current-user';

export interface IProvidedProps {
  userHasRole: (role: RoleResource) => boolean;
  userRoleForRole: (role: RoleResource) => UserRoleResource;
  roleForName: (roleName: string) => RoleResource;
  toggleRole: (roleName: string) => Promise<void>;
}

export interface IOwnProps {
  currentUser?: UserResource;
  forOrganization?: OrganizationResource;
  userRoles?: UserRoleResource[];

  // overrides the above
  // having the default be the currentUser maybe good?
  propsforUserRoles?: {
    user: UserResource;
    organization: OrganizationResource;
  };
}

export type IProps = IOwnProps & WithDataProps;

export function withUserRoles<T>(WrappedComponent) {
  class UserRoleWrapper extends React.PureComponent<T & IProps> {
    get user() {
      const { currentUser, propsforUserRoles } = this.props;

      return (propsforUserRoles && propsforUserRoles.user) || currentUser;
    }

    get userName() {
      return attributesFor(this.user).name;
    }

    get organization() {
      const { forOrganization, propsforUserRoles } = this.props;

      return (propsforUserRoles && propsforUserRoles.organization) || forOrganization;
    }

    get userRolesForOrganization(): UserRoleResource[] {
      const { userRoles } = this.props;

      if (!this.organization) {
        return [];
      }

      const userRolesForOrganization = userRoles.filter((userRole) => {
        return isRelatedRecord(userRole, this.organization);
      });

      return userRolesForOrganization;
    }

    toggleRole = async (roleName: string) => {
      const selectedRole = this.roleForName(roleName);
      const userHasRole = this.userHasRole(selectedRole);

      try {
        if (userHasRole) {
          await this.removeFromRole(selectedRole);
        } else {
          await this.addToRole(selectedRole);
        }
      } catch (e) {
        toast.error(e);
      }
    };

    addToRole = async (role: RoleResource) => {
      const { dataStore } = this.props;

      await create(dataStore, 'userRole', {
        relationships: {
          role,
          user: this.user,
          organization: this.organization,
        },
      });

      toast.success(`${this.userName} added to role`);
    };

    removeFromRole = async (role: RoleResource) => {
      const { dataStore } = this.props;

      const userRole = this.userRoleForRole(role);

      if (userRole) {
        await dataStore.update((t) => t.removeRecord(userRole), buildOptions());

        toast.success(`${this.userName} removed from role`);
      } else {
        toast.warning(`${this.userName} is not in that role`);
      }
    };

    roleForName = (roleName: string): RoleResource => {
      const { roles } = this.props;

      return roles.find((role) => attributesFor(role).roleName === roleName);
    };

    userHasRole = (role: RoleResource): boolean => {
      return !!this.userRoleForRole(role);
    };

    userRoleForRole = (role: RoleResource): UserRoleResource => {
      return this.userRolesForOrganization.find((userRole) => {
        return isRelatedRecord(userRole, role);
      });
    };

    render() {
      const { propsforUserRoles, ...otherProps } = this.props;

      const userRoleProps = {
        userHasRole: this.userHasRole,
        userRoleForRole: this.userRoleForRole,
        toggleRole: this.toggleRole,
      };

      return <WrappedComponent {...otherProps} {...userRoleProps} />;
    }
  }

  return compose(
    withOrbit((props: ICurrentUserProps & IOwnProps) => {
      const { currentUser, propsforUserRoles, userRoles } = props;

      // userRoles already present.
      if (userRoles) {
        return {};
      }

      const user = (propsforUserRoles && propsforUserRoles.user) || currentUser;

      return {
        userRoles: (q) => q.findRelatedRecords(user, 'userRoles'),
      };
    })
  )(UserRoleWrapper);
}

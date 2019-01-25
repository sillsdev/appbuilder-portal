import { compose, withProps, shouldUpdate, mapProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import pick from 'lodash/pick';

import {
  OrganizationResource,
  UserResource,
  RoleResource,
  UserRoleResource,
  attributesFor,
  idFor,
  relationshipFor,
  recordsWithIdIn,
  withLoader,
} from '@data';

import { isEmpty, unique, areResourceListsEqual, areResourcesEqual } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withCurrentUserContext } from '@data/containers/with-current-user';

import Display from './display';
import { ROLE } from '~/data/models/role';

interface INeededProps {
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
}

interface IOwnProps {
  roleNames: string;
}

interface IAfterUserRoles {
  userRoles: UserRoleResource[];
}

type IProps = INeededProps & IOwnProps & IAfterUserRoles & i18nProps;

export default compose<IProps, INeededProps>(
  withTranslations,
  withCurrentUserContext,
  withOrbit((props: INeededProps) => {
    const { user, roles } = props;
    const superAdmin = roles.find(role => attributesFor(role).roleName === ROLE.SuperAdmin);

    return {
      superAdminRoles: (q) => q.findRecords('userRoles')
                          .filter({ relation: 'role', record: superAdmin })
                          .filter({ relation: 'user', record: user }),
    };
  }),
  mapProps((allProps: any) => {
    const remainingProps = pick(allProps, [
      'user',
      'superAdminRoles',
      'currentUser',
      'organizations',
      'roles',
      't',
    ]);

    return remainingProps;
  }),
  withProps(({ currentUser, user, superAdminRoles }) => {
    const isSuperAdmin = (superAdminRoles) || [].length > 0;

    return {
      editable: isSuperAdmin || currentUser.id !== user.id,
    };
  })
)(Display);

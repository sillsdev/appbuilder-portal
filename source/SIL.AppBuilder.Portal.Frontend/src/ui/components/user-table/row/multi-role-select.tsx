import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { Dropdown } from 'semantic-ui-react';

import {
  OrganizationResource, UserResource, RoleResource,
  UserRoleResource,
  attributesFor,
  idFor,
  relationshipFor,
  recordsWithIdIn
} from '@data';
import { ROLE } from '@data/models/role';
import { isEmpty, unique } from '@lib/collection';
import { withTranslations, i18nProps } from '@lib/i18n';
import { RequireRole } from '@ui/components/authorization';

import RoleSelect from './role-select';
import ActiveRolesDisplay from './active-roles-display';

interface INeededProps {
  user: UserResource;
  organizations: OrganizationResource[];
  roles: RoleResource[];
}

interface IOwnProps {
  userRoles: UserRoleResource[];
}

type IProps =
& INeededProps
& IOwnProps
& i18nProps;

class MultiRoleSelect extends React.Component<IProps> {
  roleNames = () => {
    const { userRoles, organizations, roles } = this.props;

    const applicable = userRoles.filter(userRole => {
      const id = idFor(relationshipFor(userRole, 'organization'));

      return recordsWithIdIn(organizations, [id]).length > 0;
    });

    const names = applicable.map(userRole => {
      const roleId = idFor(relationshipFor(userRole, 'role'));
      const role = roles.find(role => role.id === roleId);

      console.log('role', role);
      return attributesFor(role).roleName;
    });

    const result = unique(names).join(', ');
    return result;
  }

  render() {
    const { roles, userRoles, organizations, user, t } = this.props;

    if (isEmpty(organizations)) {
      return t('errors.orgMembershipRequired');
    }

    return (
      <>
        <Dropdown
          data-test-role-multi-select
          multiple
          text={this.roleNames()}
          className='w-100 multiDropdown'
        >
          <Dropdown.Menu className='' data-test-role-menu>
            {
              organizations.map((organization, index) => {
                const organizationName = attributesFor(organization).name;
                const roleProps = {
                  organization,
                  user,
                  roles,
                  userRoles
                };

                return (
                  <React.Fragment key={index}>
                    <Dropdown.Header data-test-role-multi-organization-name content={organizationName} />

                    <RequireRole
                      roleName={ROLE.OrganizationAdmin}
                      forOrganization={organization}
                      componentOnForbidden={() => {
                        return (
                          <>
                            <ActiveRolesDisplay { ...roleProps } />
                          </>
                        );
                      }}>
                      <RoleSelect { ...roleProps } />
                    </RequireRole>
                  </React.Fragment>
                );
              })
            }
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

export default compose<IProps, INeededProps>(
  withTranslations,
  // share one set of userRoles for the entire list.
  // otherwise the RoleSelect's own withUserRoles will
  // make a call to get the userRoles as a convient default
  withOrbit((props: INeededProps) => {
    const { user } = props;

    return {
      userRoles: q => q.findRelatedRecords(user, 'userRoles'),
    };
  })
)(MultiRoleSelect);

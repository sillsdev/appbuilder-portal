import * as React from 'react';
import { compose, withProps } from 'recompose';
import { Dropdown } from 'semantic-ui-react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { attributesFor, GroupResource, UserResource, relationshipFor, idFor, recordsWithIdIn } from '@data';
import { isEmpty } from '@lib/collection';
import { OrganizationResource } from '@data';
import { withRelationships } from '@data/containers/with-relationship';
import { withGroupMemberships, IProvidedProps as IUserGroupProps } from '@data/containers/resources/user/with-user-groups';

import GroupSelect from './group-select';

interface IOwnProps {
  organizations: OrganizationResource[];
  groups: GroupResource[];
  user: UserResource;
  currentUser: UserResource;
}

type IProps =
  & IUserGroupProps
  & IOwnProps;

class MultiGroupSelect extends React.Component<IProps> {

  groupNames = () => {
    const { groups, userHasGroup } = this.props;
    const groupsForMemberships = groups.filter(group => {
      return userHasGroup(group);
    });

    if (isEmpty(groupsForMemberships)) {
      return "None";
    }

    return groupsForMemberships.map(group => {
      return attributesFor(group).name;
    }).join(', ');
  }

  render() {
    const { organizations, user } = this.props;

    return (
      <>
        <Dropdown
          data-test-group-multi-select
          multiple
          text={this.groupNames()}
          className='w-100 groupDropdown'
        >
          <Dropdown.Menu className='groups' data-test-group-menu>
            {
              organizations.map((organization, index) => {
                const { name } = attributesFor(organization);

                const groupCheckboxesProps = {
                  organization,
                  user
                };

                return (
                  <React.Fragment key={index} >
                    <Dropdown.Header data-test-group-multi-organization-name content={name} />
                    <GroupSelect {...groupCheckboxesProps} />
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

export default compose(
  withProps(({ user }) => {
    return {
      propsForGroupMemberships: {
        user
      }
    };
  }),
  withGroupMemberships,
  withRelationships(({ user }) => {
    return {
      allUserGroups: [user, 'groupMemberships','group']
    };
  }),
  // Filter groups that are visible for the current user
  withProps(({ allUserGroups, organizations }) => {

    let groups = [];

    if (allUserGroups) {
      groups = allUserGroups.filter(group => {
        const orgId = idFor(relationshipFor(group, 'owner'));
        return recordsWithIdIn(organizations, orgId).length > 0;
      });
    }

    return { groups };
  }),
)(MultiGroupSelect);

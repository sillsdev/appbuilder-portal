import * as React from 'react';
import { compose, withProps } from 'recompose';
import { Dropdown } from 'semantic-ui-react';

import { attributesFor, GroupResource } from '@data';
import { isEmpty } from '@lib/collection';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withLoader, OrganizationResource } from '@data';
import { withRelationships } from '@data/containers/with-relationship';
import GroupCheckboxes from './group-checkboxes';

interface IOwnProps {
  organizations: OrganizationResource[];
  userGroups: GroupResource[];
}

type IProps =
  & IOwnProps;

class GroupSelect extends React.Component<IProps> {

  render() {

    const { organizations, userGroups } = this.props;

    return (
      <>
        <Dropdown
          data-test-group-multi-select
          multiple
          text="all"
          className='w-100 groupDropdown'
        >
          <Dropdown.Menu className='groups' data-test-group-menu>
          {
            organizations && organizations.map((org, index) => {

                const { name } = attributesFor(org);

                return (
                  <React.Fragment key={index} >
                    <Dropdown.Header content={name} />
                    <GroupCheckboxes organization={org} userGroups={userGroups}/>
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
  withCurrentUser(),
  withRelationships(({ currentUser, user }) => {
    return {
      currentUserOrganizations: [currentUser, 'organizationMemberships','organization'],
      userOrganizations: [user, 'organizationMemberships', 'organization'],
      userGroups: [user, 'groupMemberships','group']
    }
  }),
  withProps(({ currentUserOrganizations, userOrganizations, ...otherProps}) => {

    if (isEmpty(userOrganizations)) {
      return {
        organizations: [],
        ...otherProps
      }
    }

    return {
      organizations: userOrganizations.filter(org =>
        currentUserOrganizations.some(o =>
          o.id === org.id
        )
      ),
      ...otherProps
    }
  }),
  withLoader(({organizations, userGroups}) => !organizations && !userGroups)
)(GroupSelect);
import * as React from 'react';
import { compose, withProps } from 'recompose';
import { Dropdown } from 'semantic-ui-react';

import { attributesFor, GroupResource, UserResource } from '@data';
import { isEmpty } from '@lib/collection';
import { OrganizationResource } from '@data';
import { withRelationships } from '@data/containers/with-relationship';
import GroupCheckboxes from './group-checkboxes';

interface IOwnProps {
  organizations: OrganizationResource[];
  userGroups: GroupResource[];
  user: UserResource;
  currentUser: UserResource;
}

type IProps =
  & IOwnProps;

class GroupSelect extends React.Component<IProps> {

  userGroupNames = () => {
    const { userGroups } = this.props;

    if (isEmpty(userGroups)) {
      return "None";
    }

    return userGroups.map(group =>
      attributesFor(group).name
    ).join(', ');
  }

  render() {

    const { organizations, userGroups, user } = this.props;

    return (
      <>
        <Dropdown
          data-test-group-multi-select
          multiple
          text={this.userGroupNames()}
          className='w-100 groupDropdown'
        >
          <Dropdown.Menu className='groups' data-test-group-menu>
          {
            organizations && organizations.map((org, index) => {

                const { name } = attributesFor(org);

                const groupCheckboxesProps = {
                  organization: org,
                  userGroups,
                  user
                }

                return (
                  <React.Fragment key={index} >
                    <Dropdown.Header content={name} />
                    <GroupCheckboxes {...groupCheckboxesProps}/>
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
  withRelationships(({ user }) => ({
    userGroups: [user, 'groupMemberships','group']
  })),
  withProps(({ userGroups }) => {
    return userGroups || [];
  })
)(GroupSelect);
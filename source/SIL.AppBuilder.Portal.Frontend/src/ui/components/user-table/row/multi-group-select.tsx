import * as React from 'react';
import { compose, withProps } from 'recompose';
import { Dropdown } from 'semantic-ui-react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { attributesFor, GroupResource, UserResource, relationshipFor, idFor, recordsWithIdIn } from '@data';
import { isEmpty } from '@lib/collection';
import { OrganizationResource } from '@data';
import { withRelationships } from '@data/containers/with-relationship';
import GroupSelect from './group-select';

interface IOwnProps {
  organizations: OrganizationResource[];
  userGroups: GroupResource[];
  user: UserResource;
  currentUser: UserResource;
}

type IProps =
  & IOwnProps;

class MultiGroupSelect extends React.Component<IProps> {

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
            organizations.map((org, index) => {

              const { name } = attributesFor(org);

              const groupCheckboxesProps = {
                organization: org,
                userGroups,
                user
              }

              return (
                <React.Fragment key={index} >
                  <Dropdown.Header content={name} />
                  <GroupSelect {...groupCheckboxesProps}/>
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
  withOrbit(({user}) => {
    return {
      groupMemberships: q => q.findRelatedRecords(user, 'groupMemberships')
    }
  }),
  withRelationships(({ user }) => ({
    allUserGroups: [user, 'groupMemberships','group']
  })),
  withProps(({ allUserGroups, organizations }) => {

    let userGroups = [];

    userGroups = allUserGroups && allUserGroups.filter(group => {
      const orgId = idFor(relationshipFor(group,'owner'));
      return recordsWithIdIn(organizations,orgId).length > 0;
    })

    return { userGroups };
  })
)(MultiGroupSelect);
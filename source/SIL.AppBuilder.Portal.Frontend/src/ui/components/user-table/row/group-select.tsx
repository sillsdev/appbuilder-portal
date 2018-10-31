import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { GroupResource, withLoader, attributesFor, OrganizationResource } from '@data';
import { Checkbox } from 'semantic-ui-react';
import { withUserGroups, IProvidedProps as IUserGroupProps } from '@data/containers/resources/user/with-user-groups';
import { isEmpty } from '@lib/collection';

interface IOwnProps {
  organization: OrganizationResource;
  groups: GroupResource[];
  userGroups: GroupResource[];
}

type IProps =
  & IOwnProps
  & IUserGroupProps;

class GroupSelect extends React.Component<IProps> {

  toggleGroup = group => e => {
    e.preventDefault();
    this.props.toggleGroup(group);
  }

  render() {

    const { groups, userHasGroup } = this.props;

    if (isEmpty(groups)) {
      return [];
    }

    return groups.map((group, index) => {
      const { name } = attributesFor(group);
      return (
        <div
          key={index}
          className="item"
          onClick={this.toggleGroup(group)}
        >
          <Checkbox
            data-test-multi-group-checkbox
            value={group.id}
            label={name}
            checked={userHasGroup(group)}
          />
        </div>
      );
    });

  }

}

export default compose(
  withOrbit(({ organization }) => ({
    groups: q => q.findRelatedRecords(organization, 'groups')
  })),
  withUserGroups
)(GroupSelect);
import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { GroupResource, withLoader, attributesFor, OrganizationResource } from '@data';
import { Checkbox } from 'semantic-ui-react';
import { withUserGroups, IProvidedProps as IUserGroupProps } from '@data/containers/resources/user/with-user-groups';

const mapRecordsToProps = ({organization}) => {

  return {
    groups: q => q.findRelatedRecords(organization,'groups')
  };

}

interface IOwnProps {
  organization: OrganizationResource;
  groups: GroupResource[];
  userGroups: GroupResource[];
}

type IProps =
  & IOwnProps
  & IUserGroupProps;

class GroupCheckboxes extends React.Component<IProps> {

  toggleGroup = group => {

    const { toggleGroup } = this.props;

    return (e) => {
      e.preventDefault();
      toggleGroup(group);
    }
  }

  render() {

    const { groups, userHasGroup } = this.props;

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
  withOrbit(mapRecordsToProps),
  withLoader(({groups}) => !groups),
  withUserGroups
)(GroupCheckboxes);
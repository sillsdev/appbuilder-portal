import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';

import { GroupResource, withLoader, attributesFor, OrganizationResource } from '@data';
import { Checkbox } from 'semantic-ui-react';

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

class GroupCheckboxes extends React.Component<IOwnProps> {

  isSelected = (groupId) => {
    const { userGroups } = this.props;
    return userGroups.map(group => group.id).includes(groupId);
  }

  render() {

    const { groups } = this.props;

    return groups.map((group, index) => {
      const { name } = attributesFor(group);
      return (
        <div key={index} className="item">
          <Checkbox
            data-test-multi-group-checkbox
            value={group.id}
            label={name}
            checked={this.isSelected(group.id)}
          />
        </div>
      );
    });

  }

}

export default compose(
  withOrbit(mapRecordsToProps),
  withLoader(({groups}) => !groups)
)(GroupCheckboxes);
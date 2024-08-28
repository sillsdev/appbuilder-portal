import * as React from 'react';
import { compose, withProps } from 'recompose';
import { withData as withOrbit } from 'react-orbitjs';
import { compareVia } from '@lib/collection';
import { GroupResource, attributesFor, OrganizationResource, UserResource } from '@data';
import { Checkbox } from 'semantic-ui-react';
import {
  withGroupMemberships,
  IProvidedProps as IUserGroupProps,
} from '@data/containers/resources/user/with-user-groups';
import { isEmpty } from '@lib/collection';

interface IOwnProps {
  user: UserResource;
  organization: OrganizationResource;
  groups: GroupResource[];
}

type IProps = IOwnProps & IUserGroupProps;

class GroupSelect extends React.Component<IProps> {
  toggleGroup = (group) => (e) => {
    e.preventDefault();
    this.props.toggleGroup(group);
  };

  render() {
    const { groups, userHasGroup } = this.props;
    groups.sort(compareVia((group) => (attributesFor(group).name || '').toLowerCase()));
    if (isEmpty(groups)) {
      return [];
    }

    return groups.map((group) => {
      const { name } = attributesFor(group);
      const isSelected = userHasGroup(group);
      return (
        <div
          data-test-group-entry
          key={group.id}
          className={`flex flex-row align-items-center
          w-100 p-sm fs-14`}
        >
          <div data-test-group-check className='item' onClick={this.toggleGroup(group)}>
            <Checkbox
              data-test-multi-group-checkbox
              toggle
              value={group.id}
              label={name}
              checked={isSelected}
            />
          </div>
        </div>
      );
    });
  }
}

export default compose(
  withOrbit(({ organization }) => ({
    groups: (q) => q.findRelatedRecords(organization, 'groups'),
  })),
  withProps((props: IOwnProps) => {
    const { user } = props;

    return {
      propsForGroupMemberships: {
        user,
      },
    };
  }),
  withGroupMemberships
)(GroupSelect);

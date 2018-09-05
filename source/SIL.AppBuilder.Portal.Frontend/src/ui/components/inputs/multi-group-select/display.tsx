import * as React from 'react';
import { compose } from 'recompose';
import { Dropdown, Checkbox } from 'semantic-ui-react';

import { attributesFor } from '@data';

import { IProvidedProps as IDataProps } from '../group-select/with-data';
import { withTranslations, i18nProps } from '@lib/i18n';

import { ResourceObject } from 'jsonapi-typescript';
import { GroupAttributes } from '@data/models/group';
import { USERS_TYPE, GROUP_MEMBERSHIPS_TYPE } from '@data';
import { UserAttributes } from '@data/models/user';
import { relationshipFor } from '@data/helpers';

interface IOwnProps {
  user: ResourceObject<USERS_TYPE, UserAttributes>;
  userGroupMemberships: Array<ResourceObject<GROUP_MEMBERSHIPS_TYPE, GroupAttributes>>;
  addGroupToUserMembership: (userId: Id, groupId: Id) => void;
  removeGroupFromMembership: (groupMembershipId: Id) => void;
}

type IProps =
  & IOwnProps
  & IDataProps
  & i18nProps;

class GroupSelectDisplay extends React.Component<IProps> {

  groupToDropdownOptions = (groups) => {

    const groupOptions = groups
      .filter(group => attributesFor(group).name)
      .map(group => ({
        text: attributesFor(group).name,
        id: group.id
      }));

    return groupOptions;
  }

  getText = () => {

    const { userGroupMemberships, groups, t } = this.props;

    if (userGroupMemberships && userGroupMemberships.length === 0) {
      return t('common.inputs.multiGroup.none');
    }

    if (userGroupMemberships.length === groups.length) {
      return t('common.inputs.multiGroup.all');
    }

    const getShortName = (text) => text.split(' ').length > 1 ? `${text.split(' ')[0]}...` : text;

    return userGroupMemberships.map(groupMembership => {

      const groupId = relationshipFor(groupMembership,'group').data.id;
      const group = groups.find(g => g.id == groupId);
      return getShortName(attributesFor(group).name);
    }).join(', ');
  }

  isGroupInUserGroupMemberships = (groupId) => {

    const { userGroupMemberships } = this.props;

    if (!userGroupMemberships) {
      return false;
    }

    const userGroupIds = userGroupMemberships.map(gm => relationshipFor(gm,'group').data.id);

    return userGroupIds.filter(userGroupId => userGroupId === groupId).length > 0;
  }

  render() {

    const { user, groups, userGroupMemberships, addGroupToUserMembership, removeGroupFromMembership } = this.props;

    if (!groups) {
      return null;
    }

    const options = this.groupToDropdownOptions(groups);

    return (
      <>
        <Dropdown
          data-test-multi-group-select
          multiple
          text={this.getText()}
          className='w-100 groupDropdown'

        >
          <Dropdown.Menu className='groups' data-test-multi-group-menu>
            {
              options.map((item, index) => {

                const groupId = item.id;
                const isInMembership = this.isGroupInUserGroupMemberships(groupId);
                const shouldAddToMembership = !isInMembership;

                return (
                  <div key={index} className="item" onClick={e => {
                    e.stopPropagation();
                    if (shouldAddToMembership) {
                      addGroupToUserMembership(user.id, groupId);
                    } else {
                      const groupMembershipId = userGroupMemberships.find(gm => {
                        debugger;
                        return relationshipFor(gm, 'group').data.id == groupId;
                      })
                      removeGroupFromMembership(groupMembershipId.id);
                    }
                  }}>
                    <Checkbox
                      data-test-multi-group-checkbox
                      value={item.id}
                      label={item.text}
                      checked={isInMembership}
                    />
                  </div>
                );
              }
              )
            }
          </Dropdown.Menu>
        </Dropdown>
      </>
    );

  }
}

export default compose(
  withTranslations
)(GroupSelectDisplay)

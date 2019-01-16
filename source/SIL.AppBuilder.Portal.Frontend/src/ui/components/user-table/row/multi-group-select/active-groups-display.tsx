import * as React from 'react';
import { compose, withProps } from 'recompose';

import {
  GroupResource,
  UserResource,
  OrganizationResource,
  attributesFor,
  isRelatedTo,
} from '@data';

import {
  withGroupMemberships,
  IProvidedProps as IUserGroupProps,
} from '@data/containers/resources/user/with-user-groups';
import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';

interface INeededProps {
  groups: GroupResource[];
  user: UserResource;
  organization: OrganizationResource;
}

interface IComposedProps {
  userHasGroup: () => boolean;
}

type IProps = INeededProps & i18nProps & IUserGroupProps & IComposedProps;

export default compose<IProps, INeededProps>(
  withTranslations,
  withProps(({ user }) => {
    return {
      propsForGroupMemberships: {
        user,
      },
    };
  }),
  withGroupMemberships
)(
  React.memo((props: IProps) => {
    const { user, organization, groups, userHasGroup, t } = props;

    const activeGroups = groups.filter((group) => {
      return userHasGroup(group) && isRelatedTo(group, 'owner', organization.id);
    });

    if (isEmpty(activeGroups)) {
      return t('common.none');
    }

    return activeGroups.map((group) => attributesFor(group).name).join(', ');
  })
);

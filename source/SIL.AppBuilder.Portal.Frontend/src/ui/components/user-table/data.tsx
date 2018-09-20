import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';
import { withTranslations, i18nProps } from '@lib/i18n';

import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { TYPE_NAME as ORGANIZATION, OrganizationAttributes } from '@data/models/organization';
import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';
import { PLURAL_NAME as GROUP_MEMBERSHIPS } from '@data/models/group-membership';
import { PLURAL_NAME as ORGANIZATION_MEMBERSHIPS, OrganizationMembershipAttributes } from '@data/models/organization-membership';
import { query, ORGANIZATION_MEMBERSHIPS_TYPE, GROUPS_TYPE, USERS_TYPE, withLoader, buildOptions, isRelatedTo, ORGANIZATIONS_TYPE } from '@data';
import { withCurrentOrganization } from '@data/containers/with-current-organization';
import { IProvidedProps as IActionProps } from '@data/containers/resources/user/with-data-actions';

function mapNetworkToProps() {
  return {
    users: [
      q => q.findRecords(USER),
      buildOptions({
        include: [`${ORGANIZATION_MEMBERSHIPS}.${ORGANIZATION}`, `${GROUP_MEMBERSHIPS}.${GROUP}`]
      })
    ],
  };
}

function mapRecordsToProps() {
  return {
    organizationMemberships: q => q.findRecords('organizationMembership'),
    groups: q => q.findRecords(GROUP)
  };
}

interface IOwnProps {
  users: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
  usersFromCache: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
  groups: Array<ResourceObject<GROUPS_TYPE, GroupAttributes>>;
  currentOrganization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  organizationMemberships: Array<ResourceObject<ORGANIZATION_MEMBERSHIPS_TYPE, OrganizationMembershipAttributes>>;
}

type IProps =
  & IOwnProps
  & i18nProps
  & IActionProps
  & WithDataProps;

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {
    isRelatedTo = (user, organizationMemberships, organization) => {
      // All organization are selected
      if (!organization) {
        return true;
      }

      const memberships = organizationMemberships.filter(om => {
        const isRelatedToUser = isRelatedTo(om, 'user', user.id);
        const isRelatedToOrg = isRelatedTo(om, 'organization', organization.id);

        return isRelatedToUser && isRelatedToOrg;
      });

      return memberships.length > 0;
    }

    render() {
      const {
        users,
        groups,
        organizationMemberships,
        currentOrganization,
        ...otherProps
      } = this.props;

      const usersToDisplay = users || [];

      const dataProps = {
        users: usersToDisplay.filter(user => {
          return (
            // TODO: need a way to test against the joined organization
            !!user.attributes && this.isRelatedTo(user, organizationMemberships, currentOrganization)
          );
        }),
        groups
      };

      return (
        <WrappedComponent
          { ...dataProps }
          { ...otherProps }
        />
      );
    }
  }

  return compose(
    withCurrentOrganization,
    query(mapNetworkToProps),
    withOrbit(mapRecordsToProps),
    withLoader(({ users, groups, organizationMemberships }) =>
        !users || !groups || !organizationMemberships
    ),
    withTranslations,
  )(DataWrapper);
}

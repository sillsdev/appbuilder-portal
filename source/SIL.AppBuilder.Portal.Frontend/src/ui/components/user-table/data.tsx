import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';
import { ResourceObject } from 'jsonapi-typescript';

import { TYPE_NAME as USER, PLURAL_NAME as USERS, UserAttributes } from '@data/models/user';
import { PLURAL_NAME as GROUP_MEMBERSHIP } from '@data/models/group-membership';
import { PLURAL_NAME as MEMBERSHIPS, OrganizationMembershipAttributes } from '@data/models/organization-membership';
import { PageLoader as Loader } from '@ui/components/loaders';
import { query, defaultSourceOptions, defaultOptions, relationshipFor, ORGANIZATION_MEMBERSHIPS_TYPE, GROUPS_TYPE, USERS_TYPE } from '@data';
import { withCurrentOrganization } from '@data/containers/with-current-organization';

function mapNetworkToProps() {

  // TODO: combine into one query when
  //       https://github.com/json-api-dotnet/JsonApiDotNetCore/issues/39
  //       is resolved
  return {
    users: [
      q => q.findRecords(USER), {
      sources: {
        remote: {
          settings: { ...defaultSourceOptions() },
          include: [MEMBERSHIPS, GROUP_MEMBERSHIP]
        }
      }
    }]
  };
}

function mapRecordsToProps() {
  return {
    usersFromCache: q => q.findRecords(USER),
    organizationMemberships: q => q.findRecords('organizationMembership')
  };
}

function mapStateToProps({ data }) {
  return {
    currentOrganizationId: data.currentOrganizationId
  };
}

interface IOwnProps {
  users: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
  usersFromCache: Array<ResourceObject<USERS_TYPE, UserAttributes>>;
  currentOrganizationId: string;
  organizationMemberships: Array<ResourceObject<ORGANIZATION_MEMBERSHIPS_TYPE, OrganizationMembershipAttributes>>;
}

type IProps =
  & IOwnProps
  & i18nProps
  & WithDataProps;

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    isLoading = () => {

      const { users,  organizationMemberships } = this.props;

      return !users || !organizationMemberships;
    }

    toggleLock = async (user) => {

      const { updateStore, t } = this.props;

      const currentLockedState = user.attributes.isLocked;
      const nextLockedState = !currentLockedState;

      const getMessage = (nextState, type = 'success') => {
        const state = nextState ? 'lock' : 'unlock';
        return t(`users.operations.${state}.${type}`);
      };

      try {
        await updateStore(us => us.replaceAttribute(
          { type: USER, id: user.id }, 'isLocked', nextLockedState
        ), defaultOptions());

        toast.success(getMessage(nextLockedState));

      } catch(e) {
        console.error(e);
        toast.error(getMessage(nextLockedState,'error'));
      }
    }

    updateUserGroups = async (user, groupsIds) => {

      const { updateStore } = this.props;

      const userGroupRelations = relationshipFor(user, 'groupMemberships');
      const userGroupMemberships = userGroupRelations.data.map(g => g.id);

      const isInUserRelations = (userGroupMemberships, groupId) => {
        return userGroupMemberships.find(uGroup => uGroup.id == groupId) != undefined;
      }

      const groupsToAdd = groupsIds.reduce((memo,groupId) => {
        if (!isInUserRelations(userGroupMemberships,groupId)) {
          memo.push(groupId);
        }
        return memo;
      },[]);

      const groupsToRemove = userGroupMemberships.reduce((memo, uGroup) => {
        if (isInUserRelations(groupsIds, uGroup.id)) {
          memo.push(uGroup.id);
        }
        return memo;
      }, []);

      try {

        updateStore(t =>
          groupsToAdd.map(gm => t.addToRelatedRecords(
            { type: 'user', id: user.id },
            'groupMemberships',
            { type:'groupMembership', id: gm.id }
          ))
        );

        updateStore(t =>
          groupsToRemove.map(gm => t.removeFromRelatedRecords(
            { type: 'user', id: user.id },
            'groupMemberships',
            { type: 'groupMembership', id: gm }
          ))
        );

      } catch (e) {
        console.error(e);

      }


    }

    isRelatedTo = (user, organizationMemberships, orgId) => {


      // All organization are selected
      if (!orgId) {
        return true;
      }

      const memberships = organizationMemberships.filter(om => {

        const relationUser = relationshipFor(om, 'user');
        const organization = relationshipFor(om, 'organization');

        const userId = (relationUser.data || {}).id;
        const organizationId = (organization.data || {}).id;

        return user.id === userId && organizationId === orgId;
      });

      return memberships.length > 0;
    }

    render() {
      const {
        users, usersFromCache,
        organizationMemberships,
        currentOrganizationId: orgId,
        ...otherProps
      } = this.props;

      // TODO: extract cache handling into query
      const usersToDisplay = (
        (usersFromCache && usersFromCache.length > 0 && usersFromCache) ||
          users || []
      );

      const dataProps = {
        users: usersToDisplay.filter(user => {
          return (
            // TODO: need a way to test against the joined organization
            !!user.attributes && this.isRelatedTo(user, organizationMemberships, orgId)
          );
        })
      };

      const actionProps = {
        toggleLock: this.toggleLock,
        updateUserGroups: this.updateUserGroups
      };

      if (this.isLoading()) {
        return <Loader />;
      }

      return (
        <WrappedComponent
          { ...dataProps }
          { ...otherProps }
          { ...actionProps }
        />
      );
    }
  }

  return compose(
    connect(mapStateToProps),
    query(mapNetworkToProps),
    withOrbit(mapRecordsToProps),
    withTranslations,
    withCurrentOrganization
  )(DataWrapper);
}

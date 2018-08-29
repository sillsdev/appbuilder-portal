import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import * as toast from '@lib/toast';
import { withTranslations, i18nProps } from '@lib/i18n';

import { TYPE_NAME as USER, PLURAL_NAME as USERS, UserAttributes } from '@data/models/user';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { TYPE_NAME as MEMBERSHIP, PLURAL_NAME as MEMBERSHIPS } from '@data/models/organization-membership';
import { PageLoader as Loader } from '@ui/components/loaders';
import { query, defaultSourceOptions, defaultOptions, isRelatedTo, relationshipFor } from '@data';
import { withCurrentOrganization } from '@data/containers/with-current-organization';
import { OrganizationMembershipAttributes } from '@data/models/organization-membership';

function mapNetworkToProps(passedProps) {

  // TODO: combine into one query when
  //       https://github.com/json-api-dotnet/JsonApiDotNetCore/issues/39
  //       is resolved
  return {
    users: [
      q => q.findRecords(USER), {
      sources: {
        remote: {
          settings: { ...defaultSourceOptions() },
          include: [MEMBERSHIPS]
        }
      }
    }],
    groups: [q => q.findRecords(GROUP), defaultOptions()]
  };
}

function mapRecordsToProps(passedProps) {
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
  users: Array<JSONAPI<UserAttributes>>;
  usersFromCache: Array<JSONAPI<UserAttributes>>;
  groups: Array<JSONAPI<GroupAttributes>>;
  currentOrganizationId: string;
  organizationMemberships: Array<JSONAPI<{}>>;
}

type IProps =
  & IOwnProps
  & i18nProps
  & WithDataProps;

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    isLoading = () => {

      const { users, groups, organizationMemberships } = this.props;

      return !users || !groups || !organizationMemberships;
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
        groups,
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
        }),
        groups
      };

      const actionProps = {
        toggleLock: this.toggleLock
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

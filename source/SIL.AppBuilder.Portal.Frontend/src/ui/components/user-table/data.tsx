import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME as USER, UserAttributes } from '@data/models/user';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';
import { PLURAL_NAME as MEMBERSHIPS } from '@data/models/organization-membership';

import { query, defaultSourceOptions, isRelatedTo } from '@data';
import { isEmpty } from '@lib/collection';

import { PageLoader as Loader } from '@ui/components/loaders';

function mapNetworkToProps(passedProps) {

  return {
    // TODO: combine into one query when
    //       https://github.com/json-api-dotnet/JsonApiDotNetCore/issues/39
    //       is resolved
    users: [
      q => q.findRecords(USER),
      {
        sources: {
          remote: {
            settings: {
              ...defaultSourceOptions
            },
            include: [MEMBERSHIPS]
          }
        }
      }
    ],
    groups: q => q.findRecords(GROUP)
  };
}

function mapStateToProps({ data }) {
  return {
    currentOrganizationId: data.currentOrganizationId
  };
}

interface IOwnProps {
  users: Array<JSONAPI<UserAttributes>>;
  groups: Array<JSONAPI<GroupAttributes>>;
  currentOrganizationId: string;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    isLoading = () => {
      const { users, groups } = this.props;

      return !users || !groups;
    }

    toggleLock = async (user) => {

      const { updateStore } = this.props;

      await updateStore(t => t.replaceAttribute(
        { type: USER, id: user.id }, 'isLocked', !user.attributes.isLocked
      ));

    }

    render() {
      const {
        users, groups,
        currentOrganizationId: orgId,
        ...otherProps
      } = this.props;

      const dataProps = {
        users: users && users.filter(user => {
          return (
            // TODO: need a way to test against the joined organization
            !!user.attributes // && isRelatedTo(user, 'organizationMemberships', orgId)
          );
        }),
        groups
      };

      const actionProps = {
        toggleLock: this.toggleLock
      }

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
  )(DataWrapper);
}

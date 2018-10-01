import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { create, idFromRecordIdentity,  ProjectResource } from '@data';
import { TYPE_NAME as ORGANIZATION } from '@data/models/organization';
import { TYPE_NAME as USER } from '@data/models/user';
import { TYPE_NAME as PROJECT, ProjectAttributes } from '@data/models/project';
import { TYPE_NAME as GROUP } from '@data/models/group';
import { TYPE_NAME as APPLICATION_TYPE } from '@data/models/application-type';

import {
  IProvidedProps as WithCurrentUserProps
} from '@data/containers/with-current-user';

import {
  IProvidedProps as WithCurrentOrganizationProps
} from '@data/containers/with-current-organization';

import { recordIdentityFromKeys } from '@data/store-helpers';

export interface IProvidedProps {
  create: (attributes: ProjectAttributes, groupId: Id, typeId: Id) => ProjectResource;
}

type IProps =
  & WithCurrentUserProps
  & WithCurrentOrganizationProps
  & WithDataProps;

export function withData(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    create = async (attributes: ProjectAttributes, groupId: Id, typeId: Id) => {
      const { dataStore, currentOrganizationId, currentUser } = this.props;
      const currentUserId = idFromRecordIdentity(currentUser);
      const groupIdentity = recordIdentityFromKeys({ type: 'group', id: groupId });
      debugger;
      const applicationTypeIdentity = recordIdentityFromKeys({ type: 'applicationType', id: typeId});


      return await create(dataStore, PROJECT, {
        attributes,
        relationships: {
          owner: { id: currentUserId, type: USER },
          group: { id: groupIdentity.keys.remoteId, type: GROUP },
          organization: { id: currentOrganizationId, type: ORGANIZATION },
          type: { id: applicationTypeIdentity.keys.remoteId, type: APPLICATION_TYPE}
        }
      });
    }

    render() {
      const props = {
        ...this.props,
        create: this.create,
      };

      return <WrappedComponent { ...props } />;
    }
  }

  return compose(
    withOrbit({})
  )(DataWrapper);
}

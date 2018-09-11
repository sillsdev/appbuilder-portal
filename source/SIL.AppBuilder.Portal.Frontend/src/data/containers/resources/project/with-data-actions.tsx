import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { defaultOptions, PROJECTS_TYPE } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { ResourceObject } from 'jsonapi-typescript';
import { recordIdentityFromKeys } from '@data/store-helpers';


export interface IProvidedProps {
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: ProjectAttributes) => any;
  updateGroup: (groupId: Id) => any;
  updateOwner: (userId: Id) => any;
}

interface IOwnProps {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withDataActions<T>(WrappedComponent) {
  class ProjectDataActionWrapper extends React.Component<IProps & T> {
    updateAttribute = async (attribute: string, value: any) => {
      const { project, dataStore } = this.props;

      await dataStore.update(
        q => q.replaceAttribute(project, attribute, value),
        defaultOptions()
      );

      this.forceUpdate();
    }

    updateAttributes = (attributes: ProjectAttributes) => {
      const { project, dataStore } = this.props;
      const { id, type } = project;

      return dataStore.update(q => q.replaceRecord({
        id, type, attributes
      }), defaultOptions());
    }

    updateGroup = (groupId: Id) => {
      const { project, dataStore } = this.props;
      const recordIdentity = recordIdentityFromKeys(project);

      return dataStore.update(q => q.replaceRelatedRecord(
        recordIdentity, 'group',
        { type: 'group', id: groupId }
      ), defaultOptions());
    }

    updateOwner = (userId: Id) => {
      const { project, updateStore } = this.props;
      const recordIdentity = recordIdentityFromKeys(project);

      return updateStore(q => q.replaceRelatedRecord(
        recordIdentity, 'owner',
        { type: 'user', id: userId }
      ), defaultOptions());
    }

    render() {
      const props = {
        ...this.props,
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
        updateGroup: this.updateGroup,
        updateOwner: this.updateOwner
      };

      return <WrappedComponent { ...props } />;
    }
  }

  return withOrbit({})(ProjectDataActionWrapper);
}

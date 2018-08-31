import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { defaultOptions, PROJECTS_TYPE } from '@data';
import { ProjectAttributes } from '@data/models/project';
import { ResourceObject } from 'jsonapi-typescript';


export interface IProvidedProps {
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
    updateAttributes = (attributes: ProjectAttributes) => {
      const { project, updateStore } = this.props;
      const { id, type } = project;

      return updateStore(q => q.replaceRecord({
        id, type, attributes
      }), defaultOptions());
    }

    updateGroup = (groupId: Id) => {
      const { project, updateStore } = this.props;
      const { id, type } = project;

      return updateStore(q => q.replaceRelatedRecord(
        { type, id }, 'group',
        { type: 'group', id: groupId }
      ), defaultOptions());
    }

    updateOwner = (userId: Id) => {
      const { project, updateStore } = this.props;
      const { id, type } = project;

      return updateStore(q => q.replaceRelatedRecord(
        { type, id }, 'owner',
        { type: 'user', id: userId }
      ), defaultOptions());
    }

    addReviewer = (email: string) => {
      console.error('not implemented');
    }

    render() {
      const props = {
        ...this.props,
        updateAttributes: this.updateAttributes,
        updateGroup: this.updateGroup,
        updateOwner: this.updateOwner
      };

      return <WrappedComponent { ...props } />;
    }
  }

  return withOrbit({})(ProjectDataActionWrapper);
}

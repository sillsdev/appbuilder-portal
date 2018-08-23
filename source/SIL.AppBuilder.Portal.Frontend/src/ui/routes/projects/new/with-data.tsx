import * as React from 'react';
import { compose } from 'recompose';
import { defaultOptions } from '@data';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { TYPE_NAME as PROJECT, ProjectAttributes } from '@data/models/project';
import { TYPE_NAME as GROUP, GroupAttributes } from '@data/models/group';

import { PageLoader as Loader } from '@ui/components/loaders';

export interface IProvidedProps {
  create: (attributes: ProjectAttributes, groupId: Id) => void;
}

type IProps =
  & WithDataProps;

export function withData(WrappedComponent) {
  class DataWrapper extends React.Component<IProps> {
    create = (attributes: ProjectAttributes, groupId: Id) => {
      const { updateStore } = this.props;

      return updateStore(q => q.addRecord({
        type: PROJECT,
        attributes,
        relationships: {
          group: {
            data: { id: groupId, type: GROUP }
          }
        }
      }), defaultOptions());
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

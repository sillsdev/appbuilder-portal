import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { defaultOptions, USERS_TYPE } from '@data';
import { UserAttributes } from '@data/models/user';
import { ResourceObject } from 'jsonapi-typescript';

export interface IProvidedProps {
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: UserAttributes) => any;
}

interface IOwnProps {
  user: ResourceObject<USERS_TYPE, UserAttributes>;
}

type IProps = IOwnProps & WithDataProps;

export function withDataActions<T>(WrappedComponent) {
  class UserDataActionWrapper extends React.Component<IProps & T> {
    updateAttribute = async (attribute: string, value: any) => {
      const { user, dataStore } = this.props;

      const u = await dataStore.update(
        (q) => q.replaceAttribute(user, attribute, value),
        defaultOptions()
      );

      this.forceUpdate();
    };

    updateAttributes = (attributes: UserAttributes) => {
      const { user, updateStore } = this.props;
      const { id, type } = user;

      return updateStore(
        (q) =>
          q.replaceRecord({
            id,
            type,
            attributes,
          }),
        defaultOptions()
      );
    };

    render() {
      const props = {
        ...this.props,
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
      };

      return <WrappedComponent {...props} />;
    }
  }

  return withOrbit({})(UserDataActionWrapper);
}

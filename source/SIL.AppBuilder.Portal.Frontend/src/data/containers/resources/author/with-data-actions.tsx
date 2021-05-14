import * as React from 'react';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ResourceObject } from 'jsonapi-typescript';

import { defaultOptions, AUTHORS_TYPE } from '@data';

import { AuthorAttributes } from '@data/models/author';

export interface IProvidedProps {
  createRecord: (attrs: AuthorAttributes, relationships) => any;
  removeRecord: () => any;
  updateAttribute: (attribute: string, value: any) => any;
  updateAttributes: (attrs: AuthorAttributes) => any;
}

interface IOwnProps {
  Author: ResourceObject<AUTHORS_TYPE, AuthorAttributes>;
}

type IProps = IOwnProps & WithDataProps;

export function withDataActions<T>(WrappedComponent) {
  class AuthorDataActionWrapper extends React.Component<IProps & T> {
    createRecord = async (attributes: AuthorAttributes, relationships) => {
      const { dataStore } = this.props;

      await dataStore.update(
        (q) =>
          q.addRecord({
            type: 'author',
            attributes,
            relationships,
          }),
        defaultOptions()
      );
    };

    removeRecord = async () => {
      const { author, dataStore } = this.props;

      await dataStore.update(
        (q) =>
          q.removeRecord({
            type: 'author',
            id: author.id,
          }),
        defaultOptions()
      );
    };

    updateAttribute = async (attribute: string, value: any) => {
      const { author, dataStore } = this.props;

      await dataStore.update((q) => q.replaceAttribute(author, attribute, value), defaultOptions());

      this.forceUpdate();
    };

    updateAttributes = (attributes: AuthorAttributes) => {
      const { author, updateStore } = this.props;
      const { id, type } = author;

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
      const actionProps = {
        createRecord: this.createRecord,
        removeRecord: this.removeRecord,
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
      };

      return <WrappedComponent {...this.props} {...actionProps} />;
    }
  }

  return withOrbit({})(AuthorDataActionWrapper);
}

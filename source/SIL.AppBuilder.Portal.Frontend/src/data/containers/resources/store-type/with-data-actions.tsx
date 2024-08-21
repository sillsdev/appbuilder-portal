import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { create, update } from '@data/store-helpers';
import { defaultOptions, StoreTypeResource } from '@data';
import { StoreTypeAttributes } from '@data/models/store-type';

export interface IProvidedProps {
  createRecord: (attributes: StoreTypeAttributes, relationships) => Promise<any>;
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: StoreTypeAttributes, relationships?: any) => any;
  updateStoreType: (owner: StoreTypeResource) => any;
}

interface IOwnProps {
  storeType: StoreTypeResource;
}

type IProps = IOwnProps & WithDataProps;

export function withDataActions<T>(WrappedComponent) {
  class StoreTypeDataActionWrapper extends React.Component<IProps & T> {
    createRecord = async (attributes: StoreTypeAttributes, relationships) => {
      const { dataStore } = this.props;

      await create(dataStore, 'storeType', {
        attributes,
        relationships,
      });
    };

    updateAttribute = (attribute: string, value: any) => {
      const { storeType, dataStore } = this.props;
      return dataStore.update(
        (q) => q.replaceAttribute(storeType, attribute, value),
        defaultOptions()
      );
    };

    updateAttributes = (attributes: StoreTypeAttributes, relationships?: any) => {
      const { storeType, dataStore } = this.props;
      return update(dataStore, storeType, {
        attributes,
        relationships,
      });
    };

    render() {
      const actionProps = {
        createRecord: this.createRecord,
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
      };

      return <WrappedComponent {...this.props} {...actionProps} />;
    }
  }

  return compose(withOrbit({}))(StoreTypeDataActionWrapper);
}

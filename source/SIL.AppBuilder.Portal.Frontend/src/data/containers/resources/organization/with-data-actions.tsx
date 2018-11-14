import * as React from 'react';
import { compose } from 'recompose';

import {
  defaultOptions,
  OrganizationResource,
  ProductDefinitionResource,
  OrganizationProductDefinitionResource,
  OrganizationStoreResource,
  relationshipFor
} from '@data';

import { requireProps } from '@lib/debug';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { OrganizationAttributes } from '@data/models/organization';

export interface IProvidedProps {
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: OrganizationAttributes) => any;
  updateProductDefinition: (productDefinition: ProductDefinitionResource) => any;
}

interface IOwnProps {
  organization: OrganizationResource;
  organizationProductDefinitions: OrganizationProductDefinitionResource[];
  organizationStores: OrganizationStoreResource[];
}


type IProps =
  & IOwnProps
  & WithDataProps;

const mapRecordsToProps = (passedProps) => {

  const { organization } = passedProps;

  return {
    organizationProductDefinitions: q =>
      q.findRelatedRecords(organization, 'organizationProductDefinitions'),
    organizationStores: q =>
      q.findRelatedRecords(organization, 'organizationStores')
  };
};

export function withDataActions<T>(WrappedComponent) {

  class OrganizationDataActionWrapper extends React.Component<IProps & T> {

    updateAttribute = async (attribute: string, value: any) => {
      const { organization, dataStore } = this.props;

      try {

        await dataStore.update(
          q => q.replaceAttribute(organization, attribute, value),
          defaultOptions()
        );
      } catch (e) {
        console.log(e);
      }
    }

    updateAttributes = async (attributes: OrganizationAttributes) => {
      const { organization, dataStore } = this.props;
      const { id, type } = organization;

      try {
        await dataStore.update(q =>
          q.replaceRecord({ id, type, attributes }),
          defaultOptions()
        );
      } catch(e) {
        console.log(e);
      }
    }

    updateProductDefinition = (productDefinition) => {

      const { organization, organizationProductDefinitions, dataStore } = this.props;

      const opdSelected = organizationProductDefinitions.find(opd => {
        const { data } = relationshipFor(opd, 'productDefinition');
        return data.id === productDefinition.id;
      });

      if (opdSelected) {

        return dataStore.update(q => q.removeRecord({
          type: 'organizationProductDefinition',
          id: opdSelected.id
        }), defaultOptions());

      }

      return dataStore.update(q => q.addRecord({
        type: 'organizationProductDefinition',
        attributes: {},
        relationships: {
          organization: { data: organization },
          productDefinition: { data: productDefinition }
        }
      }), defaultOptions());

    }

    updateStore = (store) => {

      const { organization, organizationStores, dataStore } = this.props;

      const storeSelected = organizationStores.find(opd => {
        const { data } = relationshipFor(opd, 'store');
        return data.id === store.id;
      });

      if (storeSelected) {

        return dataStore.update(q => q.removeRecord({
          type: 'organizationStore',
          id: storeSelected.id
        }), defaultOptions());

      }

      return dataStore.update(q => q.addRecord({
        type: 'organizationStore',
        attributes: {},
        relationships: {
          organization: { data: organization },
          store: { data: store }
        }
      }), defaultOptions());

    }

    render() {
      const actionProps = {
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
        updateProductDefinition: this.updateProductDefinition,
        updateStore: this.updateStore
      };

      return <WrappedComponent {...this.props} {...actionProps} />;
    }

  }

  return compose(
    withOrbit(mapRecordsToProps),
    requireProps('organization')
  )(OrganizationDataActionWrapper);

}
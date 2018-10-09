import * as React from 'react';
import { compose } from 'recompose';

import {
  defaultOptions,
  OrganizationResource,
  ProductDefinitionResource,
  OrganizationProductDefinitionResource,
  relationshipFor
} from '@data';

import { recordIdentityFromKeys } from '@data/store-helpers';
import { requireProps } from '@lib/debug';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { OrganizationAttributes } from '@data/models/organization';
import {  } from '@data/models/organization-product-definition';

export interface IProvidedProps {
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: OrganizationAttributes) => any;
  updateProductDefinition: (productDefinition: ProductDefinitionResource) => any;
}

interface IOwnProps {
  organization: OrganizationResource;
  organizationProductDefinitions: OrganizationProductDefinitionResource[];
}


type IProps =
  & IOwnProps
  & WithDataProps;

const mapRecordsToProps = (passedProps) => {

  const { organization } = passedProps;

  return {
    organizationProductDefinitions: q =>
      q.findRelatedRecords(organization, 'organizationProductDefinitions')
  };
};

export function withDataActions<T>(WrappedComponent) {

  class OrganizationDataActionWrapper extends React.Component<IProps & T> {

    updateAttribute = async (attribute: string, value: any) => {
      const { organization, dataStore } = this.props;

      await dataStore.update(
        q => q.replaceAttribute(organization, attribute, value),
        defaultOptions()
      );

      this.forceUpdate();
    }

    updateAttributes = (attributes: OrganizationAttributes) => {
      const { organization, dataStore } = this.props;
      const { id, type } = organization;

      return dataStore.update(q => q.replaceRecord({
        id, type, attributes
      }), defaultOptions());
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

    render() {
      const actionProps = {
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
        updateProductDefinition: this.updateProductDefinition
      };

      return <WrappedComponent {...this.props} {...actionProps} />;
    }

  }

  return compose(
    withOrbit(mapRecordsToProps),
    requireProps('organization')
  )(OrganizationDataActionWrapper);

}
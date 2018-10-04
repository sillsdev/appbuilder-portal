import * as React from 'react';
import { compose } from 'recompose';

import { defaultOptions, OrganizationResource, ProductDefinitionResource } from '@data';
import { recordIdentityFromKeys } from '@data/store-helpers';
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
}


type IProps =
  & IOwnProps
  & WithDataProps;

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

      const { organization, dataStore } = this.props;
      const recordIdentity = recordIdentityFromKeys(organization);

      // TODO: Handle organizationRelationShip

      return null;
    }

    render() {
      const actionProps = {
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
      };

      return <WrappedComponent {...this.props} {...actionProps} />;
    }

  }

  return compose(
    withOrbit({}),
    requireProps('organization')
  )(OrganizationDataActionWrapper);

}
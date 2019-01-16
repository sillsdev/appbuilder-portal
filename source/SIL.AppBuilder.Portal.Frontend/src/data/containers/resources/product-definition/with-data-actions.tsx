import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { create, update } from '@data/store-helpers';

import {
  defaultOptions,
  ProductDefinitionResource,
  ApplicationTypeResource,
  WorkflowDefinitionResource,
} from '@data';

import { ProductDefinitionAttributes } from '@data/models/product-definition';

export interface IProvidedProps {
  createRecord: (attributes: ProductDefinitionAttributes, relationships) => Promise<any>;
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: ProductDefinitionAttributes, relationships?: any) => any;
  updateType: (type: ApplicationTypeResource) => any;
  updateWorkflow: (workflow: WorkflowDefinitionResource) => any;
}

interface IOwnProps {
  productDefinition: ProductDefinitionResource;
}

type IProps = IOwnProps & WithDataProps;

export function withDataActions<T>(WrappedComponent) {
  class ProductDefinitionDataActionWrapper extends React.Component<IProps & T> {
    createRecord = async (attributes: ProductDefinitionAttributes, relationships) => {
      const { dataStore } = this.props;

      await create(dataStore, 'productDefinition', {
        attributes,
        relationships,
      });
    };

    updateAttribute = (attribute: string, value: any) => {
      const { productDefinition, dataStore } = this.props;
      return dataStore.update(
        (q) => q.replaceAttribute(productDefinition, attribute, value),
        defaultOptions()
      );
    };

    updateAttributes = (attributes: ProductDefinitionAttributes, relationships?: any) => {
      const { productDefinition, dataStore } = this.props;
      return update(dataStore, productDefinition, {
        attributes,
        relationships,
      });
    };

    updateType = (type) => {
      const { productDefinition, dataStore } = this.props;

      return dataStore.update(
        (q) => q.replaceRelatedRecord(productDefinition, 'type', type),
        defaultOptions()
      );
    };

    updateWorkflow = (workflow) => {
      const { productDefinition, dataStore } = this.props;

      return dataStore.update(
        (q) => q.replaceRelatedRecord(productDefinition, 'workflow', workflow),
        defaultOptions()
      );
    };

    render() {
      const actionProps = {
        createRecord: this.createRecord,
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
        updateType: this.updateType,
        updateWorkflow: this.updateWorkflow,
      };

      return <WrappedComponent {...this.props} {...actionProps} />;
    }
  }

  return compose(withOrbit({}))(ProductDefinitionDataActionWrapper);
}

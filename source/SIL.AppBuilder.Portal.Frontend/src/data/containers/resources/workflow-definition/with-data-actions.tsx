import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { create, update } from '@data/store-helpers';

import {
  defaultOptions,
  WorkflowDefinitionResource,
  StoreTypeResource
} from '@data';

import { WorkflowDefinitionAttributes } from '@data/models/workflow-definition';

export interface IProvidedProps {
  createRecord: (attributes: WorkflowDefinitionAttributes, relationships) => Promise<any>;
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: WorkflowDefinitionAttributes, relationships?:any) => any;
  updateStoreType: (owner: StoreTypeResource) => any;
}

interface IOwnProps {
  workflowDefinition: WorkflowDefinitionResource;
}


type IProps =
  & IOwnProps
  & WithDataProps;

export function withDataActions<T>(WrappedComponent) {

  class WorkflowDefinitionDataActionWrapper extends React.Component<IProps & T> {

    createRecord = async (attributes: WorkflowDefinitionAttributes, relationships) => {

      const { dataStore } = this.props;

      await create(dataStore,'workflowDefinition', {
        attributes,
        relationships
      });
    }

    updateAttribute = (attribute: string, value: any) => {
      const { workflowDefinition, dataStore } = this.props;
      return dataStore.update(
        q => q.replaceAttribute(workflowDefinition, attribute, value),
        defaultOptions()
      );
    }

    updateAttributes = (attributes: WorkflowDefinitionAttributes, relationships?: any) => {
      const { workflowDefinition, dataStore } = this.props;
      return update(dataStore, workflowDefinition, {
        attributes,
        relationships
      });
    }

    updateStoreType = (storeType) => {

      const { workflowDefinition, dataStore } = this.props;

      return dataStore.update(q =>
        q.replaceRelatedRecord(workflowDefinition,'storeType',storeType),
        defaultOptions()
      );

    }

    render() {
      const actionProps = {
        createRecord: this.createRecord,
        updateAttributes: this.updateAttributes,
        updateAttribute: this.updateAttribute,
        updateStoreType: this.updateStoreType
      };

      return <WrappedComponent {...this.props} {...actionProps} />;
    }

  }

  return compose(
    withOrbit({})
  )(WorkflowDefinitionDataActionWrapper);

}
import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import {
  defaultOptions,
  WorkflowDefinitionResource,
  StoreTypeResource
} from '@data';

import { WorkflowDefinitionAttributes } from '@data/models/workflow-definition';

export interface IProvidedProps {
  createRecord: (attributes: WorkflowDefinitionAttributes, relationships) => Promise<any>;
  updateAttribute: (attribute: string, value: any) => Promise<any>;
  updateAttributes: (attrs: WorkflowDefinitionAttributes) => any;
  updateStoreType: (owner: StoreTypeResource) => any;
}

interface IOwnProps {
  workflowDefinition: WorkflowDefinitionResource;
}


type IProps =
  & IOwnProps
  & WithDataProps;

const mapRecordsToProps = (passedProps) => {

  const { workflowDefinition } = passedProps;
  
  if (!workflowDefinition) {
    return {};
  }

  return {
  };
};

export function withDataActions<T>(WrappedComponent) {

  class WorkflowDefinitionDataActionWrapper extends React.Component<IProps & T> {

    createRecord = async (attributes: WorkflowDefinitionAttributes, relationships) => {

      const { dataStore } = this.props;
      
      await dataStore.update(
        q => q.addRecord({
          type: 'workflowDefinition',
          attributes,
          relationships
        }),
        defaultOptions()
      );
    }

    updateAttribute = (attribute: string, value: any) => {
      const { workflowDefinition, dataStore } = this.props;

      return dataStore.update(
        q => q.replaceAttribute(workflowDefinition, attribute, value),
        defaultOptions()
      );
    }

    updateAttributes = (attributes: WorkflowDefinitionAttributes) => {
      const { workflowDefinition, dataStore } = this.props;
      const { id, type } = workflowDefinition;

      return dataStore.update(q =>
        q.replaceRecord({ id, type, attributes }),
        defaultOptions()
      );
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
    withOrbit(mapRecordsToProps)
  )(WorkflowDefinitionDataActionWrapper);

}
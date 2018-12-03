import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type WORKFLOW_DEFINITION_TYPE = 'workflowDefinition';

export interface WorkflowDefinitionAttributes extends AttributesObject {
  name: string;
  description: string;
  enabled: boolean;
  workflowBusinessFlow: string;
  workflowScheme: string;
}

export type WorkflowDefinitionResource = ResourceObject<WORKFLOW_DEFINITION_TYPE, WorkflowDefinitionAttributes>;

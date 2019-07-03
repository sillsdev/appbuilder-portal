import { AttributesObject, ResourceObject } from 'jsonapi-typescript';

export type WORKFLOW_DEFINITIONS_TYPE = 'workflowDefinition';
export const TYPE_NAME = 'workflowDefinition';

export interface WorkflowDefinitionAttributes extends AttributesObject {
  // actual attributes;
  name?: string;
  enabled?: boolean;
  description?: string;
  workflowScheme?: string;
  workflowBusinessFlow?: string;
  type?: number;
}

export type WorkflowDefinitionResource = ResourceObject<
  WORKFLOW_DEFINITIONS_TYPE,
  WorkflowDefinitionAttributes
>;

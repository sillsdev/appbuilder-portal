import { idSchema } from '$lib/valibot';
import * as v from 'valibot';
import { ProductType, WorkflowOptions } from 'sil.appbuilder.portal.common/workflow';

export const businessFlows = [
  'SIL_AppBuilders_AssetPackage_Flow',
  'SIL_AppBuilders_Web_Flow',
  'SIL_Default_AppBuilders_Android_GooglePlay_Flow',
  'SIL_Default_AppBuilders_Android_S3_Flow'
];

export const workflowDefinitionSchemaBase = v.object({
  name: v.nullable(v.string()),
  storeType: idSchema,
  productType: v.pipe(idSchema, v.enum(ProductType)),
  workflowType: idSchema,
  workflowScheme: v.nullable(v.string()),
  workflowBusinessFlow: v.nullable(v.picklist(businessFlows)),
  description: v.nullable(v.string()),
  properties: v.nullable(v.string()),
  options: v.array(v.pipe(idSchema, v.enum(WorkflowOptions))),
  enabled: v.boolean()
});

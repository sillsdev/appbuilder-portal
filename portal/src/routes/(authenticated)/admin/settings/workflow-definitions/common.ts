import { idSchema, propertiesSchema } from '$lib/valibot';
import { ProductType, WorkflowOptions } from 'sil.appbuilder.portal.common/workflow';
import * as v from 'valibot';

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
  properties: propertiesSchema,
  options: v.array(v.pipe(idSchema, v.enum(WorkflowOptions))),
  enabled: v.boolean()
});

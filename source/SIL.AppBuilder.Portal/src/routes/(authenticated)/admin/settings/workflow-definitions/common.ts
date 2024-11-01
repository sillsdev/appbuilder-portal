import { idSchema } from '$lib/valibot';
import * as v from 'valibot';
import { ProductType, WorkflowOptions } from 'sil.appbuilder.portal.common/workflow';

export const workflowDefinitionSchemaBase = v.object({
  name: v.nullable(v.string()),
  storeType: idSchema,
  productType: v.pipe(idSchema, v.enum(ProductType)),
  workflowType: idSchema,
  workflowScheme: v.nullable(v.string()),
  workflowBusinessFlow: v.nullable(v.string()),
  description: v.nullable(v.string()),
  properties: v.nullable(v.string()),
  options: v.array(v.pipe(idSchema, v.enum(WorkflowOptions))),
  enabled: v.boolean()
});
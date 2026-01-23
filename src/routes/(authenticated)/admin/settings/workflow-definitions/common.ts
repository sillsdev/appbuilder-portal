import * as v from 'valibot';
import { idSchema, propertiesSchema } from '$lib/valibot';
import { ProductType, WorkflowOptions } from '$lib/workflowTypes';

export const workflowDefinitionSchemaBase = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1)),
  storeType: idSchema,
  productType: v.pipe(idSchema, v.enum(ProductType)),
  workflowType: idSchema,
  description: v.nullable(v.string()),
  properties: propertiesSchema,
  options: v.array(v.pipe(idSchema, v.enum(WorkflowOptions))),
  enabled: v.boolean()
});

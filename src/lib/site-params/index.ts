import type * as v from 'valibot';
import type { SiteParamSchemas } from '$lib/valibot';

export type SiteParams = keyof typeof SiteParamSchemas;

export type SiteParamValueKey<P extends SiteParams> = keyof v.InferOutput<
  (typeof SiteParamSchemas)[P]
>;

export type SiteParamValue<P extends SiteParams, K extends SiteParamValueKey<P>> = v.InferOutput<
  (typeof SiteParamSchemas)[P]
>[K];

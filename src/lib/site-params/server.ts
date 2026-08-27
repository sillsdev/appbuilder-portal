import * as v from 'valibot';
import { DatabaseReads } from '$lib/server/database';
import { SiteParamSchemas, type SiteParamValueKey, type SiteParams } from '$lib/site-params';

export async function getSiteParam<P extends SiteParams, K extends SiteParamValueKey<P>>(
  param: P,
  key: K
) {
  const schema = SiteParamSchemas[param];
  const res = v.safeParse(
    v.pipe(v.nullish(v.string(), ''), v.parseJson(), schema),
    (
      await DatabaseReads.adminSettings.findUnique({
        where: { Key: param },
        select: {
          Value: true
        }
      })
    )?.Value
  );

  return res.success
    ? res.output[key]
    : // @ts-expect-error I can't quite get the TS magic to work here, but it otherwise functions as it should
      (schema.entries[key].default as SiteParamValue<P, K>);
}

import { query, buildOptions } from '@data';
import { buildFindRecord } from '@data/store-helpers';

export function withPublicProject<T>(idGetter: (props: T) => string) {
  return (WrappedComponent) => {
    return query(
      (props: T) => {
        const id = idGetter(props);

        const options = buildOptions({
          include: [
            'organization.owner',
            'group',
            'owner',
            'products.product-definition.type',
            'products.product-builds.product-artifacts',
          ],
          fields: {
            // owner: 'name,email',
          },
        });

        // do not pass an org id if we want to get a public project
        // for _any_ organization
        delete options.sources.remote.settings.headers.Organization;

        return {
          cacheKey: id,
          project: [(q) => buildFindRecord(q, 'project', id), options],
        };
      },
      {
        passthroughError: true,
        useRemoteDirectly: true,
      }
    )(WrappedComponent);
  };
}

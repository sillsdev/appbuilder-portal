export const project = {
  type: 'projects',
  id: '1',
  attributes: {
    name: 'Dummy project',
    'date-archived': null,
    language: 'English',
    'owner-id': 1,
  },
  relationships: {
    organization: { data: { id: 1, type: 'organizations' } },
    group: { data: { id: 1, type: 'groups' } },
    owner: { data: { id: 1, type: 'users' } },
    products: { data: [{ id: 1, type: 'products' }] },
  },
};

export const projectsResponse = {
  data: [{ ...project }],
  included: [
    { type: 'organizations', id: 1, attributes: { name: 'Dummy organization' } },
    { type: 'groups', id: 1, attributes: { name: 'Some Group' } },
    {
      type: 'products',
      id: 1,
      attributes: {
        'date-created': '2018-10-20T16:19:09.878193',
        'date-updated': '2018-10-20T16:19:09.878193',
        'date-built': '2018-10-20T16:19:09.878193',
        'date-published': '2018-10-20T16:19:09.878193',
        'version-built': 'v1.0.0',
      },
      relationships: {
        'product-definition': { data: { type: 'product-definitions', id: 1 } },
        project: { data: { type: 'projects', id: 1 } },
        productBuilds: { data: [{ type: 'product-build', id: 1 }] },
      },
    },
    {
      type: 'product-definitions',
      id: 1,
      attributes: {
        description: 'Publish Android app to S3',
        name: 'Android to S3',
      },
    },
    {
      type: 'product-build',
      id: 1,
      attributes: {
        version: 'v1.0.0',
      },
      relationships: {
        product: { data: { type: 'product', id: 1 } },
      },
    },
  ],
};

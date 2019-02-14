// TODO:
// figure out an API that is something like this:
//
// paths.stores # => '/rates'
// paths.stores.create #=> '/rates/create'
// paths.stores.show(id) # => '/rates/id'
export const paths = {
  root: {
    path: () => '/admin',
  },
  settings: {
    path: () => '/admin/settings',

    organizations: {
      path: () => '/admin/settings/organizations',
    },
    workflowDefinitions: {
      path: () => '/admin/settings/workflow-definitions',
    },
    productDefinitions: {
      path: () => '/admin/settings/product-definitions',
    },
    stores: {
      path: () => '/admin/settings/stores',
      create: {
        path: () => '/admin/settings/stores/new',
      },
      edit: {
        path: (id = ':id') => `/admin/settings/stores/${id}/edit`,
      },
    },
    storeTypes: {
      path: () => '/admin/settings/store-types',
    },
  },
};

export const paths = {
  root: {
    path: '/admin',
  },
  settings: {
    path: '/admin/settings',

    organizations: {
      path: '/admin/settings/organizations',
    },
    workflowDefinitions: {
      path: '/admin/settings/workflow-definitions',
    },
    productDefinitions: {
      path: '/admin/settings/product-definitions',
    },
    stores: {
      path: '/admin/settings/stores',
      create: {
        path: '/admin/settings/stores/new',
      },
      edit: {
        name: `/admin/settings/stores/:id/edit`,
        path(id) {
          return `/admin/settings/stores/${id}/edit`;
        },
      },
    },
    storeTypes: {
      path: '/admin/settings/store-types',
    },
  },
};

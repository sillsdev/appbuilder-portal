export enum COLUMN_KEY {
  PROJECT_NAME = 'name',
  PROJECT_OWNER = 'owner',
  PROJECT_ORGANIZATION = 'organization',
  PROJECT_LANGUAGE = 'language',
  PROJECT_GROUP = 'group',
  PROJECT_DATE_UPDATED = 'dateUpdated',

  PRODUCT_BUILD_VERSION = 'buildVersion',
  PRODUCT_BUILD_DATE = 'buildDate',
  PRODUCT_CREATED_ON = 'createdOn',
}

export const possibleColumnsByType = {
  project: {
    [COLUMN_KEY.PROJECT_OWNER]: {
      id: COLUMN_KEY.PROJECT_OWNER,
      i18nKey: 'projectTable.columns.owner',
      propertyPath: 'owner.name',
      sortable: true,
    },
    [COLUMN_KEY.PROJECT_ORGANIZATION]: {
      id: COLUMN_KEY.PROJECT_ORGANIZATION,
      i18nKey: 'projectTable.columns.organization',
      propertyPath: 'organization.name',
      sortable: true,
    },
    [COLUMN_KEY.PROJECT_LANGUAGE]: {
      id: COLUMN_KEY.PROJECT_LANGUAGE,
      i18nKey: 'projectTable.columns.language',
      propertyPath: 'language',
      sortable: true,
    },
    [COLUMN_KEY.PROJECT_GROUP]: {
      id: COLUMN_KEY.PROJECT_GROUP,
      i18nKey: 'projectTable.columns.group',
      propertyPath: 'group.name',
      sortable: true,
    },
    [COLUMN_KEY.PROJECT_DATE_UPDATED]: {
      id: COLUMN_KEY.PROJECT_DATE_UPDATED,
      i18nKey: 'projectTable.columns.updatedOn',
      propertyPath: 'dateUpdated',
      sortable: true,
    },
  },
  product: {
    [COLUMN_KEY.PRODUCT_BUILD_VERSION]: {
      id: COLUMN_KEY.PRODUCT_BUILD_VERSION,
      i18nKey: 'projectTable.columns.buildVersion',
      propertyPath: 'product[].buildVersion',
    },
    [COLUMN_KEY.PRODUCT_BUILD_DATE]: {
      id: COLUMN_KEY.PRODUCT_BUILD_DATE,
      i18nKey: 'projectTable.columns.buildDate',
      propertyPath: 'product[].buildDate',
    },
    [COLUMN_KEY.PRODUCT_CREATED_ON]: {
      id: COLUMN_KEY.PRODUCT_CREATED_ON,
      i18nKey: 'projectTable.columns.createdOn',
      propertyPath: 'product[].createdOn',
    },
  },
};

export const possibleColumns = {
  ...possibleColumnsByType.project,
  ...possibleColumnsByType.product,
};

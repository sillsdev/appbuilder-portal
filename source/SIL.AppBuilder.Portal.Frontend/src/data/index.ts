export { default as DataProvider } from './provider';

export { defaultSourceOptions, defaultOptions } from './store';
export {
  create,
  update,
  buildNew,
  recordIdentityFrom,
  idFromRecordIdentity,
  buildFindRecord,
  buildOptions,
  buildFindRelatedRecords,
  buildFindRelatedRecord,
  localIdFromRecordIdentity,
} from './store-helpers';

export {
  attributesFor, idFor,
  relationshipsFor, hasRelationship, isRelatedTo,
  relationshipFor, firstError,
  isRelatedRecord,
  idsForRelationship,
  recordsWithIdIn
} from './helpers';

export { withLoader } from './containers/with-loader';

export { queryApi as query } from './query';

export { pushPayload } from './push-payload';

export { TASKS_TYPE, TaskResource } from './models/task';
export { NOTIFICATIONS_TYPE, NotificationResource } from './models/notification';

// JSONAPI types
export type ORGANIZATIONS_TYPE = 'organizations';
export type GROUPS_TYPE = 'groups';
export type PROJECTS_TYPE = 'projects';
export type USERS_TYPE = 'users';
export type PRODUCTS_TYPE = 'products';
export type ORGANIZATION_MEMBERSHIPS_TYPE = 'organization-memberships';
export type GROUP_MEMBERSHIPS_TYPE = 'group-memberships';

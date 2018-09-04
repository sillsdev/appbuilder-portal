import { serializer } from './store';

export { default as DataProvider } from './provider';
export { defaultSourceOptions, defaultOptions } from './store';

export {
  attributesFor, idFor,
  relationshipsFor, hasRelationship, isRelatedTo,
  relationshipFor, firstError
} from './helpers';

export { queryApi as query } from './query';

export async function pushPayload(updateStore, payload) {
  const normalized =  serializer.deserializeDocument(payload);

  const datas = Array.isArray(normalized.data) ? normalized.data : [normalized.data];
  const resources = datas.concat(normalized.included || []);

  await updateStore(
    q => resources.map(
      resource => q.addRecord(resource)), { skipRemote: true });
}



// JSONAPI types
export type ORGANIZATIONS_TYPE = 'organizations';
export type GROUPS_TYPE = 'groups';
export type PROJECTS_TYPE = 'projects';
export type USERS_TYPE = 'users';
export type PRODUCTS_TYPE = 'products';
export type TASKS_TYPE = 'tasks';
export type ORGANIZATION_MEMBERSHIPS_TYPE = 'organization-memberships';
export type GROUP_MEMBERSHIPS_TYPE = 'group-memberships';
export type NOTIFICATIONS_TYPE = 'notifications';

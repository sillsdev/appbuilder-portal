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

import { schema, keyMap } from './schema';
import { serializer } from './store';
import { recordIdentityFrom } from './store-helpers';

export async function pushPayload(updateStore, payload) {
  const normalized =  serializer.deserializeDocument(payload);

  const datas = buildDatas(normalized);
  const included = buildIncluded(normalized);
  const resources = datas.concat(included);

  fixRelationships(resources);

  assignIdsToResources(resources);

  await updateStore(
    q => resources.map(
      resource => q.addRecord(resource)), { skipRemote: true });
}

function buildIncluded(normalized) {
  const included = normalized.included || [];

  return included;
}

function buildDatas(normalized) {
  const data = normalized.data;
  const records = Array.isArray(data) ? data : [data];

  return records;
}

function fixRelationships(resources) {
  resources.forEach(resource => {
    Object.keys(resource.relationships || {}).forEach(relationName => {
      const relation = resource.relationships[relationName] || {};
      const data = relation.data;

      if (!data) {
        return;
      }

      const isHasMany = Array.isArray(data);
      const datas = isHasMany ? data : [data];

      datas.forEach((d, index) => {
        const recordIdentity = recordIdentityFrom(d.id, d.type);
        const localId = recordIdentity.id;

        d.id = localId;
      });
    });
  });
}

function assignIdsToResources(resources) {
  resources.forEach(assignIds);
}

function assignIds(resource) {
  resource.keys = { remoteId: resource.id };
  resource.id = keyMap.idFromKeys(resource.type, resource.keys) || schema.generateId(resource.type);
}
import {
  SingleResourceDoc,
  AttributesObject, ResourceObject,
  RelationshipsObject, RelationshipsWithData,
  ErrorObject,
  ResourceLinkage
} from "jsonapi-typescript";

import { idFromRecordIdentity, localIdFromRecordIdentity } from './store-helpers';

type IJsonApiPayload<TType extends string, TAttrs extends AttributesObject> =
  | SingleResourceDoc<TType, TAttrs>
  | ResourceObject<TType, TAttrs>;

export function attributesFor<
  TType extends string,
  TAttrs extends AttributesObject
  >(payload: IJsonApiPayload<TType, TAttrs>): TAttrs {

  if (!payload) { return ({} as TAttrs); }

  const data = (payload as SingleResourceDoc<TType, TAttrs>).data;
  if (data) { return attributesFor(data); }

  const attributes = (payload as ResourceObject<TType, TAttrs>).attributes;

  return (attributes || {}) as TAttrs;
}

export function idFor(payload: any): string {
  if (payload.data) { return idFor(payload.data); }

  return payload.id;
}

export function idsForRelationship(collection, relationshipName) {
  const localIds = collection.map(record => {
    const relationData = relationshipFor(record, relationshipName).data;

    if (!relationData) { return; }

    return localIdFromRecordIdentity(relationData);
  }).filter(id => id);

  return localIds;
}

export function recordsWithIdIn(collection, ids) {
  return collection.filter(record => ids.includes(record.id));
}

export function relationshipsFor<
  TType extends string,
  TAttrs extends AttributesObject
  >(payload: IJsonApiPayload<TType, TAttrs>): RelationshipsObject {
  if (!payload) { return {}; }

  const data = (payload as SingleResourceDoc<TType, TAttrs>).data;
  if (data) { return relationshipsFor(data); }


  const relationships = (payload as ResourceObject<TType, TAttrs>).relationships;

  return relationships || {};
}

export function hasRelationship(payload, name: string): boolean {
  const filtered = relationshipFor(payload, name);
  const data = (filtered.data || []) as any[];

  return data.length > 0;
}

export function relationshipFor(payload: any, relationshipName: string): RelationshipsWithData {
  const relationships = relationshipsFor(payload);
  const relation = relationships[relationshipName] || {};

  return relation as RelationshipsWithData;
}

export function isRelatedTo(payload: any, relationshipName: string, id: string): boolean {
  const relation = relationshipFor(payload, relationshipName);
  const relationData = relation.data || {} as ResourceLinkage;

  if (Array.isArray(relationData)) {
    return !!relationData.find(r => r.id === id);
  }

  return relationData.id === id;
}

export function isRelatedRecord<TType extends string = ''>(payload: any, record: ResourceObject<TType>) {
  const id = idFromRecordIdentity<TType>(record as any);

  return isRelatedTo(payload, record.type, id) || isRelatedTo(payload, record.type, record.id);
}

export function firstError(json): ErrorObject {
  if (!json || !json.errors) { return {}; }

  const errors = json.errors || [];
  const first = errors[0];

  return first || {};
}

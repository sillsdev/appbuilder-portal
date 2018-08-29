type IJsonApiPayload<T> =
  | JSONAPIDocument<T>
  | JSONAPI<T>;

export function attributesFor<T>(payload: IJsonApiPayload<T>): T | object {
  if (!payload) { return {}; }
  if (payload.data) { return attributesFor(payload.data); }

  return payload.attributes || {};
}

export function idFor(payload: any): string {
  if (payload.data) { return idFor(payload.data); }

  return payload.id;
}

export function relationshipsFor(payload: IJsonApiPayload<T>): T | object {
  if (!payload) { return {}; }
  if (payload.data) { return relationshipsFor(payload.data); }

  return payload.relationships || {};
}

export function hasRelationship(payload, name: string): boolean {
  const relationships = relationshipsFor(payload);
  const filtered = relationships[name] || {};
  const data = filtered.data || [];

  return data.length > 0;
}

export function relationshipFor(payload: any, relationshipName: string) {
  const relationships = relationshipsFor(payload);
  const relation = relationships[relationshipName] || {};

  return relation;
}

export function isRelatedTo(payload: any, relationshipName: string, id: string) {
  const relationships = relationshipsFor(payload);
  const relation = relationships[relationshipName] || {};
  const relationData = relation.data || {} as object | object[];

  if (Array.isArray(relationData)) {
    return relationData.find(r => r.id === id);
  }

  return relationData.id === id;
}

export function firstError(json) {
  if (!json || !json.errors) { return {}; }

  const errors = json.errors || [];
  const first = errors[0];

  return first || {};
}

type IJsonApiPayload<T> =
  | JSONAPI<T>
  | { data: JSONAPI<T> };

export function attributesFor<T>(payload: IJsonApiPayload<T>): T | object {
  if (!payload) { return {}; }
  if (payload.data) { return attributesFor(payload.data); }

  return payload.attributes || {};
}

export function idFor(payload: any): string {
  if (payload.data) { return idFor(payload.data); }

  return payload.id;
}

export function relationshipsFor(payload: IJsonApiPayload<T>): T | object[] {
  if (!payload) { return {}; }
  if (payload.data) { return relationshipsFor(payload.data); }

  return payload.relationships || [];
}

export function hasRelationship(payload, name: string): boolean {
  const relationships = relationshipsFor(payload);
  const filtered = relationships[name] || {};
  const data = filtered.data || [];

  return data.length > 0;

}

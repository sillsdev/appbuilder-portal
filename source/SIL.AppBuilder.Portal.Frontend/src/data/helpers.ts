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

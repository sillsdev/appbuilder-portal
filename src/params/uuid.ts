import { safeParse } from 'valibot';
import { UUIDSchema } from '$lib/valibot';

export function match(param: string) {
  const parsed = safeParse(UUIDSchema, param);
  return parsed.success;
}

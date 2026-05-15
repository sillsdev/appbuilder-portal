import { pipe, safeParse, string, uuid } from 'valibot';

export function match(param: string) {
  const parsed = safeParse(pipe(string(), uuid()), param);
  return parsed.success;
}

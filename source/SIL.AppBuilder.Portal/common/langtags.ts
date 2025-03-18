import { writeFile } from 'fs/promises';
import { join } from 'path';

// The only reason this exists here is so that it can be called from vite.config.ts
export async function refreshLangTags(localDir: string) {
  const langtags: {
    tag: string;
    full: string;
    name: string;
    localname: string;
    code: string;
    regions: string[];
  }[] = await (await fetch('https://ldml.api.sil.org/langtags.json')).json();
  const parsed = langtags
    .filter((tag) => !tag.tag.startsWith('_'))
    .map(({ tag, full, name, localname, code, regions }) => ({
      tag,
      full,
      name,
      localname,
      code,
      regions
    }));
  const output = JSON.stringify(parsed);
  await writeFile(join(localDir, 'langtags.json'), output);
  return parsed;
}
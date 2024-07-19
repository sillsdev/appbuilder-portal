import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { writeFile } from 'fs/promises';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'fetch-langtags',
      async buildStart() {
        const langtags: {
          tag: string;
          full: string;
          name: string;
          localname: string;
          code: string;
          regions: string[];
        }[] = await (
          await fetch('https://raw.githubusercontent.com/silnrsi/langtags/master/pub/langtags.json')
        ).json();
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
        return await writeFile('src/lib/langtags.json', output);
      }
    },
    paraglide({ project: './project.inlang', outdir: './src/lib/paraglide' }),
    sveltekit()
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

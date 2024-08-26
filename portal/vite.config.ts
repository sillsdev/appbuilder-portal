import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { spawn } from 'child_process';
import { stat, writeFile } from 'fs/promises';
import { loadEnv, searchForWorkspaceRoot } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), '/common']
    }
  },
  plugins: [
    {
      name: 'fetch-langtags',
      async buildStart() {
        // Only update langtags if they are a day old
        let needToRefresh = true;
        try {
          needToRefresh =
            Date.now() - (await stat('src/lib/langtags.json')).mtimeMs >
            /* One day */ 1000 * 60 * 60 * 24;
        } catch {
          /* empty */
        }
        if (needToRefresh) {
          const langtags: {
            tag: string;
            full: string;
            name: string;
            localname: string;
            code: string;
            regions: string[];
          }[] = await (
            await fetch(
              'https://raw.githubusercontent.com/silnrsi/langtags/master/pub/langtags.json'
            )
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
      }
    },
    paraglide({ project: './project.inlang', outdir: './src/lib/paraglide' }),
    sveltekit(),
    {
      name: 'Run BullMQ Worker',
      configureServer(server) {
        if (server.config.mode === 'development') {
          const compilingProcess = spawn('npx', ['tsc', '--project', 'tsconfig.dev.json'], {
            cwd: 'node-server',
            stdio: 'pipe',
            shell: true
          });
          compilingProcess.once('close', () => {
            const env = Object.assign(loadEnv(server.config.mode, process.cwd()), process.env);
            const executingProcess = spawn('node', ['dev.js'], {
              cwd: 'node-server',
              stdio: 'pipe',
              shell: true,
              env
            });
            executingProcess.stderr.on('data', (dat) => process.stderr.write(dat));
            executingProcess.stdout.on('data', (dat) => process.stdout.write(dat));
            server.httpServer?.on('close', () => executingProcess.kill());
          });
        }
      }
    }
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

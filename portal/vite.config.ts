import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import {
  createEmitAndSemanticDiagnosticsBuilderProgram,
  createWatchCompilerHost,
  createWatchProgram,
  sys,
  type BuilderProgram,
  type Watch
} from 'typescript';
import { loadEnv, searchForWorkspaceRoot } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), '/common']
    },
    port: 6173
  },
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      // As best as I can tell, `['url']` corresponds the closest to what we were doing before Paraglide changed the API
      strategy: ['url']
    }),
    (() => {
      let executingProcess: ChildProcessWithoutNullStreams;
      let running: boolean;
      let watchProgram: Watch<BuilderProgram>;
      return {
        name: 'Run BullMQ Worker',
        configureServer(server) {
          if (server.config.mode === 'development') {
            if (watchProgram) return;
            spawn('tsc', ['-w'], {
              cwd: 'common',
              stdio: 'pipe',
              shell: true
            });
            const env = Object.assign(loadEnv(server.config.mode, process.cwd()), process.env);
            watchProgram = createWatchProgram(
              createWatchCompilerHost(
                'node-server/tsconfig.dev.json',
                {},
                sys,
                createEmitAndSemanticDiagnosticsBuilderProgram,
                () => {},
                async (arg) => {
                  // First event (code 6031) is compilation started. Ignore it
                  if (arg.code === 6031) return;
                  if (executingProcess) {
                    if (running) return;
                    running = true;
                    const prom = new Promise((r) => executingProcess.once('close', r));
                    executingProcess.kill();
                    await prom;
                  }
                  executingProcess = spawn('node', ['--import=./otel.js', 'dev.js'], {
                    cwd: 'node-server',
                    stdio: 'pipe',
                    shell: true,
                    env
                  });
                  executingProcess.stderr.on('data', (dat) => process.stderr.write(dat));
                  executingProcess.stdout.on('data', (dat) => process.stdout.write(dat));
                  server.httpServer?.on('close', () => executingProcess.kill());
                  running = false;
                }
              )
            );
          }
        }
      };
    })()
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

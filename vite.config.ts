import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { type ChildProcessWithoutNullStreams, spawn } from 'child_process';
import {
  type BuilderProgram,
  type Watch,
  createEmitAndSemanticDiagnosticsBuilderProgram,
  createWatchCompilerHost,
  createWatchProgram,
  sys
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
  preview: {
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
    })
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

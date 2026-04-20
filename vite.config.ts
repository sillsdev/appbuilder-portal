import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: {
    port: 6173
  },
  preview: {
    port: 6173
  },
  build: {
    sourcemap: true
  },
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({
      project: './paraglide/default.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['url'],
      // allow for everything except /downloads/* or user-data
      routeStrategies: [
        { match: '/downloads', exclude: true },
        { match: '/user-data', exclude: true }
      ]
    }),
    paraglideVitePlugin({
      project: './paraglide/google-play.inlang',
      outdir: './src/lib/google-play/paraglide',
      strategy: ['url'],
      // allow only for /downloads/* or user-data
      routeStrategies: [{ match: '((?!downloads|user-data))', exclude: true }]
    })
  ],
  optimizeDeps: {
    // Force a single shared pre-bundled chunk for state-management-core so that
    // both @ethnolib/language-chooser-controller and @ethnolib/state-management-svelte
    // share the same module instance. Without this, each gets its own bundled
    // copy, causing duck-type checks and shared state to operate on separate instances.
    include: ['@ethnolib/state-management-core']
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

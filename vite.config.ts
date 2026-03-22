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
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      // As best as I can tell, `['url']` corresponds the closest to what we were doing before Paraglide changed the API
      strategy: ['url']
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

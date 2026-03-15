import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    exclude: [
      '@ethnolib/language-chooser-svelte-daisyui',
      '@ethnolib/language-chooser-controller',
      '@ethnolib/find-language',
      '@ethnolib/state-management-svelte'
    ]
  },
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
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

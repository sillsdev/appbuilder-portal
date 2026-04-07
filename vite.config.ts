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
      // allow for everything except /user-data/*
      routeStrategies: [{ match: '/user-data', exclude: true }]
    }),
    paraglideVitePlugin({
      project: './paraglide/udm.inlang',
      outdir: './src/lib/udm/paraglide',
      strategy: ['url'],
      // allow only for /user-data/*
      routeStrategies: [{ match: '((?!user-data))', exclude: true }]
    })
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

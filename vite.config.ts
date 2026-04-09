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
      // allow for everything except /downloads/*
      routeStrategies: [{ match: '/downloads', exclude: true }]
    }),
    paraglideVitePlugin({
      project: './paraglide/google-play.inlang',
      outdir: './src/lib/google-play/paraglide',
      strategy: ['url'],
      // allow only for /downloads/*
      routeStrategies: [{ match: '((?!downloads))', exclude: true }]
    })
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

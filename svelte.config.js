import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  vitePlugin: {
    // Required for @ethnolib/state-management-svelte, which ships a pre-bundled
    // .js file that uses $state() in a class body (compiled from a .svelte.ts source).
    // Without this, Vite won't run the Svelte compiler on the package, leaving the
    // $state() call untransformed and causing runtime errors.
    prebundleSvelteLibraries: true
  },

  kit: {
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      out: 'out/build'
    })
  }
};

export default config;

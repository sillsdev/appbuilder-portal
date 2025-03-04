import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [
    {
      style: async ({attributes}) => {
        if (!attributes.lang?.endsWith('postcss')) return;
        return new Promise(resolve => {
          resolve({code: '', map: ''});
        });
      },

    },
    vitePreprocess()
  ],

  kit: {
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      out: 'out/build'
    })
  }
};

export default config;

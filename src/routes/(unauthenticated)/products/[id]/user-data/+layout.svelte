<script lang="ts">
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let isDarkMode = $state(
    browser ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );

  $effect(() => {
    if (!browser) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      isDarkMode = event.matches;
    };

    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  });
</script>

<div data-theme={isDarkMode ? 'dark' : 'light'} class="contents">
  {@render children?.()}
</div>

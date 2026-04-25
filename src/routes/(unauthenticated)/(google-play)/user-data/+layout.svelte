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

    return () => {
      media.removeEventListener('change', onChange);
    };
  });
</script>

<div data-theme={isDarkMode ? 'dark' : 'light'} class="relative w-full min-h-screen">
  <div
    class="pointer-events-none fixed inset-0 z-0"
    style={`background-color: ${isDarkMode ? 'var(--udm-outer-dark, #111827)' : 'var(--udm-outer-light, #f5f7fa)'};`}
  ></div>
  <div class="relative z-10">
    {@render children?.()}
  </div>
</div>

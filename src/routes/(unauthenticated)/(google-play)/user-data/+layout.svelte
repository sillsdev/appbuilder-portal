<script lang="ts">
  import type { Snippet } from 'svelte';
  import '$lib/google-play/udm-theme.css';
  import { isDarkMode } from '$lib/stores';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div data-theme={$isDarkMode ? 'dark' : 'light'} class="relative w-full min-h-screen">
  {@render children?.()}
</div>

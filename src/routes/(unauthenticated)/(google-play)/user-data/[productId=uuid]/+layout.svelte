<script lang="ts">
  import type { Snippet } from 'svelte';
  import '$lib/google-play/udm-theme.css';
  import type { LayoutData } from './$types';
  import { getThemeStyle } from '$lib/utils/theme';

  interface Props {
    children?: Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();
</script>

<svelte:head>
  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    async
    defer
  ></script>
</svelte:head>

<div class="relative w-full min-h-screen" style={getThemeStyle(data.app.themeColor)}>
  {@render children?.()}
</div>

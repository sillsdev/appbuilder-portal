<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { createl10nMapFromEntries, l10nMap } from '$lib/locales.svelte';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  $effect(() => {
    l10nMap.value = createl10nMapFromEntries(data.localizedNames);
  });
</script>

<div
  data-theme="light"
  class="grid grid-cols-1 w-full min-h-screen place-items-stretch place-content-start text-base-content sm:place-items-center sm:place-content-center"
>
  {@render children?.()}
</div>

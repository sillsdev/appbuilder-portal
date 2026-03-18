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
  class="grid w-full h-full place-items-center place-content-center text-base-content"
>
  {@render children?.()}
</div>

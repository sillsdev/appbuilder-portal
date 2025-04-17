<script
  lang="ts"
  generics="Group extends { Id: number; Name: string | null } & Record<string, unknown>"
>
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import type { Snippet } from 'svelte';

  interface Props {
    groups: Group[];
    selector?: Snippet<[Group]>;
  }

  let { groups, selector }: Props = $props();
</script>

<div class="flex w-full">
  <div class="shrink space-y-2">
    {#each groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
      <div class="flex space-x-2">
        {@render selector?.(group)}
        <span>{group.Name}</span>
      </div>
    {/each}
  </div>
  <div class="grow"></div>
</div>

<script lang="ts">
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    groups: { Id: number; Name: string | null }[];
    selected: number[];
  }

  let { groups, selected = $bindable() }: Props = $props();
</script>

<div class="flex w-full">
  <div class="shrink space-y-2">
    {#each groups.toSorted((a, b) => byName(a, b, languageTag())) as group}
      <div class="flex space-x-2">
        <input
          type="checkbox"
          class="toggle toggle-accent"
          value={group.Id}
          bind:group={selected}
        />
        <span>{group.Name}</span>
      </div>
    {/each}
  </div>
  <div class="grow"></div>
</div>

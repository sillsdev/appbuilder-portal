<script lang="ts" generics="T">
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let props: HTMLInputAttributes = {};
  export let getList: (searchTerm: string) => T[];
  let search: string = '';
  $: list = getList(search);
</script>

<div class="autocomplete">
  <input type="text" class="input input-bordered" bind:value={search} {...props} />
  {#if list.length}
    <ul class="bg-base-200 absolute z-10 rounded p-2">
      {#each list as item}
        <li>
          <slot name="listElement" {item} />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
</style>

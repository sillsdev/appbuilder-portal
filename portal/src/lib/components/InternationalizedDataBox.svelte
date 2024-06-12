<!--
    @component
    A container box with a title and rows of internationalized information
    
-->
<script lang="ts">
  import Icon from '@iconify/svelte';
  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  export let title;
  export let fields: { key: string; value?: string | null }[];
  export let editable = false;
  const dispatch = createEventDispatcher<{
    edit: null;
  }>();
</script>

<div class="flex flex-row border border-slate-600 p-2 mx-4 m-1 rounded-md">
  <div class="relative w-full">
    <h3>{title}</h3>
    {#if editable}
      <button class="absolute right-2 top-2" on:click={() => dispatch('edit')}
        ><Icon icon="mdi:pencil" /></button
      >
    {/if}
    {#each fields as field}
      <p>
        <b>{$_(field.key)}: </b>
        {field.value ?? ''}
      </p>
    {/each}
  </div>
</div>

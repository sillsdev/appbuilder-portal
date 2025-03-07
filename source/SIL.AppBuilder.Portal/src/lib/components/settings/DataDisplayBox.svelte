<!--
    @component
    A container box with a title and rows of internationalized information
    
-->
<script lang="ts">
  import type { ValidI13nKey } from '$lib/i18n';
  import * as m from '$lib/paraglide/messages';
  import Icon from '@iconify/svelte';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    title: any;
    fields: { key: ValidI13nKey; value?: string | null }[];
    editable?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    title,
    fields,
    editable = false,
    children
  }: Props = $props();
  const dispatch = createEventDispatcher<{
    edit: null;
  }>();
</script>

<div class="flex flex-row border border-slate-600 p-2 mx-4 m-1 rounded-md">
  <div class="relative w-full">
    <h3>{title}</h3>
    {#if editable}
      <button title="Edit" class="absolute right-2 top-2" onclick={() => dispatch('edit')}>
        <Icon width="24" icon="mdi:pencil" />
      </button>
    {/if}
    {#each fields as field}
      <p style="padding-left: 1rem; text-indent: -1rem">
        <b>{m[field.key]()}:</b>
        {field.value ?? ''}
      </p>
    {/each}
    {@render children?.()}
  </div>
</div>

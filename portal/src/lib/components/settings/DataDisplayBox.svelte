<!--
    @component
    A container box with a title and rows of internationalized information   
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { ValidI13nKey } from '$lib/i18n';
  import { m } from '$lib/paraglide/messages';
  import Icon from '@iconify/svelte';

  interface Props {
    title: string | null;
    data?: T;
    fields: {
      key: ValidI13nKey;
      value?: string | null;
      snippet?: import('svelte').Snippet<[T | undefined]>;
    }[];
    editable?: boolean;
    children?: import('svelte').Snippet;
    onEdit?: () => void;
  }

  let { title, data, fields, editable = false, children, onEdit }: Props = $props();
</script>

<div class="flex flex-row border border-slate-600 p-2 mx-4 m-1 rounded-md">
  <div class="relative w-full">
    <h3>{title}</h3>
    {#if editable}
      <button title="Edit" class="absolute right-2 top-2" onclick={() => onEdit?.()}>
        <Icon width="24" icon="mdi:pencil" />
      </button>
    {/if}
    {#each fields as field}
      <p style="padding-left: 1rem; text-indent: -1rem">
        <b>{m[field.key]()}:</b>
        {#if field.snippet}
          {@render field.snippet(data)}
        {:else}
          {field.value ?? ''}
        {/if}
      </p>
    {/each}
    {@render children?.()}
  </div>
</div>

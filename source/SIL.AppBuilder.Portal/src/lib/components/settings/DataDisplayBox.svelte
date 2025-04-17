<!--
    @component
    A container box with a title and rows of internationalized information   
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import Icon from '@iconify/svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string | null;
    data?: T;
    fields: {
      key: ValidI13nKey;
      messageParms?: any;
      value?: string | null;
      snippet?: Snippet<[T | undefined]>;
    }[];
    editable?: boolean;
    editTitle?: string;
    children?: Snippet;
    onEdit?: () => void;
  }

  let { title, data, fields, editable = false, editTitle, children, onEdit }: Props = $props();
</script>

<div class="flex flex-row border border-slate-600 p-2 mx-4 m-1 rounded-md">
  <div class="relative w-full">
    <h3>{title}</h3>
    {#if editable}
      <button
        title={editTitle ?? m.common_clickToEdit()}
        class="absolute right-2 top-2 cursor-pointer"
        onclick={() => onEdit?.()}
      >
        <Icon width="24" icon="mdi:pencil" />
      </button>
    {/if}
    {#each fields as field}
      <p style="padding-left: 1rem; text-indent: -1rem">
        <b>{m[field.key](field.messageParms)}:</b>
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

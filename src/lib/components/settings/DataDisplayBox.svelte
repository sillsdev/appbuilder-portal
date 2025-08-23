<!--
    @component
    A container box with a title and rows of internationalized information   
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import Icon from '@iconify/svelte';
  import type { Snippet } from 'svelte';
  import type { ValueKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    title: string | null;
    data?: T;
    fields: (ValueKey & {
      value?: string | null;
      snippet?: Snippet<[T | undefined]>;
      faint?: boolean;
    })[];
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
      <p
        style="padding-left: 1rem; text-indent: -1rem"
        class:opacity-40={field.faint}
        class="wrap-anywhere"
      >
        <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
        <b>{m[field.key](field.params as any)}:</b>
        {#if field.snippet}
          {@render field.snippet(data)}
        {:else}
          <span>{field.value ?? ''}</span>
        {/if}
      </p>
    {/each}
    {@render children?.()}
  </div>
</div>

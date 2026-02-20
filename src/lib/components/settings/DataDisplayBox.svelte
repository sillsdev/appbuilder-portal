<!--
    @component
    A container box with a title and rows of internationalized information   
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import type { ValueKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    title: string | Snippet;
    data?: T;
    fields: (ValueKey & {
      value?: string | null;
      snippet?: Snippet<[T | undefined]>;
      faint?: boolean;
    })[];
    editable?: boolean;
    editTitle?: string;
    editLink?: string;
    children?: Snippet;
  }

  let { title, data, fields, editable = false, editTitle, editLink, children }: Props = $props();
</script>

<div class="flex flex-row border border-slate-600 p-2 mx-4 m-1 rounded-md">
  <div class="relative w-full">
    {#if typeof title === 'string'}
      <h3>{title}</h3>
    {:else}
      {@render title()}
    {/if}
    {#if editable && editLink}
      <a
        href={editLink}
        title={editTitle ?? m.common_clickToEdit()}
        class="absolute right-2 top-2 cursor-pointer"
      >
        <IconContainer width={24} icon={Icons.Edit} />
      </a>
    {/if}
    {#each fields as field}
      <p
        style="padding-left: 1rem; text-indent: -1rem"
        class:opacity-40={field.faint}
        class={['wrap-anywhere', field.class]}
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

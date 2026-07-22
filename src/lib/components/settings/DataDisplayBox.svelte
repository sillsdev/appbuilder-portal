<!--
    @component
    A container box with a title and rows of internationalized information   
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { ValueKey } from '$lib/utils';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type FieldProp<T = any> = ValueKey & {
    faint?: boolean;
    // eslint-disable-next-line no-undef
  } & ({ value: string | number | null } | App.SnippetWithArgs<T>);

  interface Props {
    class?: ClassValue;
    title: string | Snippet;
    fields: FieldProp[];
    editable?: boolean;
    editTitle?: string;
    editLink?: string;
    children?: Snippet;
  }

  let {
    class: classes,
    title,
    fields,
    editable = false,
    editTitle,
    editLink,
    children
  }: Props = $props();
</script>

<div class={['flex flex-row border border-slate-600 p-2 mx-4 m-1 rounded-md', classes]}>
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
      <div
        style="padding-left: 1rem; text-indent: -1rem"
        class:opacity-40={field.faint}
        class={['wrap-anywhere', field.class]}
      >
        <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
        <b>{m[field.key](field.params as any)}:</b>
        {#if 'snippet' in field}
          {@render field.snippet(field.args)}
        {:else}
          <span>{field.value ?? ''}</span>
        {/if}
      </div>
    {/each}
    {@render children?.()}
  </div>
</div>

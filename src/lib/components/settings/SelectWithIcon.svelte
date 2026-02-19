<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue, HTMLOptionAttributes, HTMLSelectAttributes } from 'svelte/elements';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    class?: ClassValue;
    items: {
      Id: number;
      Name: string;
      icon?: string;
      attr?: HTMLOptionAttributes;
    }[];
    value: number | null;
    extra?: Snippet;
    attr?: HTMLSelectAttributes;
    icon?: string;
  }

  let { class: classes, items, value = $bindable(), extra, attr = {}, icon = '' }: Props = $props();

  const current = $derived(items.find((item) => item.Id === value));
</script>

<div class={['select gap-4', classes]}>
  {#if current}
    <IconContainer icon={current.icon || icon} width={20} class="absolute left-0 px-2 opacity-80" />
  {/if}
  <select {...attr} bind:value class:spacing={current}>
    {@render extra?.()}
    {#each items.toSorted((a, b) => byName(a, b, getLocale())) as item}
      <option {...item.attr} value={item.Id}>
        <IconContainer icon={item.icon || icon} width={20} class="opacity-80" />
        {item.Name}
      </option>
    {/each}
  </select>
</div>

<style>
  .spacing {
    padding-inline-start: calc((0.25rem * 3) + 20px) !important;
  }
</style>

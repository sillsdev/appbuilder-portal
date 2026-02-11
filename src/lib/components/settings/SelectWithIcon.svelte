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
      icon: string;
      attr?: HTMLOptionAttributes;
    }[];
    value: number | null;
    extra?: Snippet;
    attr?: HTMLSelectAttributes;
  }

  let { class: classes, items, value = $bindable(), extra, attr = {} }: Props = $props();

  const current = $derived(items.find((item) => item.Id === value));
</script>

<div class={['select gap-4', classes]}>
  {#if current}
    <IconContainer icon={current.icon} width={20} />
  {/if}
  <select {...attr} bind:value class:ps-0!={current}>
    {@render extra?.()}
    {#each items.toSorted((a, b) => byName(a, b, getLocale())) as item}
      <option {...item.attr} value={item.Id}>
        <IconContainer icon={item.icon} width={20} />
        {item.Name}
      </option>
    {/each}
  </select>
</div>

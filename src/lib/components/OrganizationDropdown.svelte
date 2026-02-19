<script lang="ts">
  import type { ClassValue, HTMLSelectAttributes } from 'svelte/elements';
  import IconContainer from './IconContainer.svelte';
  import { org_allOrganizations } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  interface Props {
    organizations: { Id: number; Name: string | null }[];
    value: number | null;
    class?: ClassValue;
    allowNull?: boolean;
    selectProperties?: HTMLSelectAttributes;
  }

  let {
    organizations,
    value = $bindable(),
    class: classes,
    allowNull = false,
    selectProperties = {}
  }: Props = $props();

  $effect(() => {
    if (organizations.length === 1) {
      value = organizations[0].Id;
    }
  });
</script>

<div class={['select gap-4', classes]}>
  <IconContainer
    icon="clarity:organization-solid"
    width={20}
    class="absolute left-0 px-2 opacity-80"
  />
  <select bind:value {...selectProperties} class="spacing">
    {#if organizations.length === 1}
      <option selected value={organizations[0].Id}>{organizations[0].Name}</option>
    {:else}
      {#if allowNull}
        <option value={null} selected>{org_allOrganizations()}</option>
      {/if}
      {#each organizations.toSorted((a, b) => byName(a, b, getLocale())) as organization}
        <option value={organization.Id}>{organization.Name}</option>
      {/each}
    {/if}
  </select>
</div>

<style>
  .spacing {
    padding-inline-start: calc((0.25rem * 3) + 20px) !important;
  }
</style>

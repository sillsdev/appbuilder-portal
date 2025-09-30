<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import { org_allOrganizations } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  interface Props {
    organizations: { Id: number; Name: string | null }[];
    value: number | null;
    className?: string;
    allowNull?: boolean;
    selectProperties?: HTMLSelectAttributes;
  }

  let {
    organizations,
    value = $bindable(),
    className = '',
    allowNull = false,
    selectProperties = {}
  }: Props = $props();
</script>

<select class="select select-bordered {className}" bind:value {...selectProperties}>
  {#if allowNull}
    <option value={null} selected>{org_allOrganizations()}</option>
  {/if}
  {#each organizations.toSorted((a, b) => byName(a, b, getLocale())) as organization}
    <option value={organization.Id}>{organization.Name}</option>
  {/each}
</select>

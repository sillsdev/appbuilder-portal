<script lang="ts">
  import type { ClassValue, HTMLSelectAttributes } from 'svelte/elements';
  import { org_allOrganizations } from '$lib/paraglide/messages';
  import SelectWithIcon from './settings/SelectWithIcon.svelte';
  import type { Prisma } from '@prisma/client';
  interface Props {
    organizations: Prisma.OrganizationsGetPayload<{ select: { Id: true; Name: true } }>[];
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

<SelectWithIcon
  bind:value
  items={organizations}
  attr={selectProperties}
  class={classes}
  icon="clarity:organization-solid"
>
  {#snippet extra()}
    {#if allowNull}
      <option value={null} selected>{org_allOrganizations()}</option>
    {/if}
  {/snippet}
</SelectWithIcon>

<script lang="ts">
  import { org_allOrganizations } from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils';
  export let organizations: { Id: number; Name: string | null }[];
  export let value: number | null;
  export let className: string = '';
  export let allowNull: boolean = false;
</script>

<select class="select select-bordered {className}" bind:value {...$$restProps}>
  {#if allowNull}
    <option value={null} selected>{org_allOrganizations()}</option>
  {/if}
  {#each organizations.toSorted((a, b) => byName(a, b, languageTag())) as organization}
    <option value={organization.Id}>{organization.Name}</option>
  {/each}
</select>

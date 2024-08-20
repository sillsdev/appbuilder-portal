<script lang="ts">
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import * as m from '$lib/paraglide/messages';
  import ProjectSelector from '../projects/components/ProjectSelector.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let langCode: string;
  let productDefinitionFilter: string;
  let organizationFilter: string;
</script>

<ProjectSelector
  projects={data.projects.filter((proj) => {
    return (
      (proj.Language ?? '').includes(langCode) &&
      (!productDefinitionFilter ||
        proj.Products.some((prod) => prod.ProductDefinitionName === productDefinitionFilter)) &&
      (!organizationFilter || proj.OrganizationName === organizationFilter)
    );
  })}
>
  <h1 slot="header" class="p-4 pl-6">{m.sidebar_projectDirectory()}</h1>
  <div
    slot="options"
    class="w-full flex flex-row place-content-start p-4 pb-0 space-between-4 flex-wrap gap-1"
  >
    <select class="select select-bordered" bind:value={organizationFilter}>
      <option value="">All organizations</option>
      {#each new Set(data.projects.map((p) => p.OrganizationName)).values() as org}
        <option value={org}>{org}</option>
      {/each}
    </select>

    <LanguageCodeTypeahead bind:langCode />
    <select class="select select-bordered max-w-full" bind:value={productDefinitionFilter}>
      <!-- TODO: i18n -->
      <option value="" selected>Any product definitions</option>
      {#each data.productDefinitions as pD}
        <option value={pD.Name}>{pD.Name}</option>
      {/each}
    </select>
    <!-- TODO: Filter by update time -->
  </div>
</ProjectSelector>

<style>
  :global(.highlight) {
    background-color: oklch(var(--a));
  }
  :global(li:first-child .listElement) {
    border-radius: 0.375rem 0.375rem 0 0;
  }
  :global(li:last-child .listElement) {
    border-radius: 0 0 0.375rem 0.375rem;
    border-bottom-width: 1px;
  }
  :global(li[aria-selected='true'] .listElement) {
    background-color: oklch(var(--b2));
  }
</style>

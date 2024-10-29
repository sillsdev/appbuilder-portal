<script lang="ts">
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import * as m from '$lib/paraglide/messages';
  import 'flatpickr/dist/flatpickr.css';
  import ProjectCard from '../projects/components/ProjectCard.svelte';
  import type { PageData } from './$types';
  import { languageTag } from '$lib/paraglide/runtime';

  export let data: PageData;

  // TODO: almost certainly this page needs to be paginated
  // This means that the filtering here may need to be moved to the server
  // The alternative is to send all the data to the client at once and show only a
  // limited portion, which is a possibility depending on how much total data there is

  let langCode: string;
  let productDefinitionFilter: string;
  let organizationFilter: string;
  let updateDates: [Date, Date] | null;

  let searchTerm: string = '';

  $: filteredProjects = data.projects.filter((project) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (project.Name?.toLowerCase().includes(searchTermLower.toLowerCase()) ||
        project.Language?.toLowerCase().includes(searchTermLower) ||
        project.OwnerName?.toLowerCase().includes(searchTermLower) ||
        project.OrganizationName?.toLowerCase().includes(searchTermLower) ||
        project.GroupName?.toLowerCase().includes(searchTermLower)) &&
      (!updateDates ||
        !updateDates[1] ||
        !project.DateUpdated ||
        (project.DateUpdated > updateDates[0] && project.DateUpdated < updateDates[1])) &&
      (project.Language ?? '').includes(langCode) &&
      (!productDefinitionFilter ||
        project.Products.some((prod) => prod.ProductDefinitionName === productDefinitionFilter)) &&
      (!organizationFilter || project.OrganizationName === organizationFilter)
    );
  });
</script>

<div class="w-full max-w-6xl mx-auto relative px-2">
  <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
    <div class="inline-block">
      <h1 class="p-4 pl-6">{m.sidebar_projectDirectory()}</h1>
    </div>
    <div class="w-full flex flex-row place-content-start p-4 pb-0 space-between-4 flex-wrap gap-1">
      <select class="select select-bordered" bind:value={organizationFilter}>
        <option value="">{m.org_allOrganizations()}</option>
        {#each new Set(data.projects.map((p) => p.OrganizationName)).values() as org}
          <option value={org}>{org}</option>
        {/each}
      </select>

      <LanguageCodeTypeahead bind:langCode />
      <select class="select select-bordered max-w-full" bind:value={productDefinitionFilter}>
        <option value="" selected>{m.productDefinitions_filterAllProjects()}</option>
        {#each data.productDefinitions as pD}
          <option value={pD.Name}>{pD.Name}</option>
        {/each}
      </select>
      <DateRangePicker
        bind:chosenDates={updateDates}
        placeholder={m.directory_filters_dateRange()}
      />
    </div>
  </div>
  {#if filteredProjects.length > 0}
    <div class="w-full relative p-4">
      {#each filteredProjects.sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? '', languageTag())) as project}
        <ProjectCard {project} />
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.projectTable_empty()}</p>
  {/if}
</div>

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

<script lang="ts">
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import * as m from '$lib/paraglide/messages';
  import 'flatpickr/dist/flatpickr.css';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
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
      [
        project.Name,
        project.Language,
        project.OwnerName,
        project.OrganizationName,
        project.GroupName
      ].some((field) => field?.toLowerCase().includes(searchTermLower)) &&
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
    <div
      class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center mx-4 gap-1 mobile-sizing"
    >
      <select class="select select-bordered mobile-sizing" bind:value={organizationFilter}>
        <option value="">{m.org_allOrganizations()}</option>
        {#each new Set(data.projects.map((p) => p.OrganizationName)).values() as org}
          <option value={org}>{org}</option>
        {/each}
      </select>
      <div class="input input-bordered flex items-center gap-2 mobile-sizing">
        <input type="text" placeholder={m.search()} class="flex-grow" bind:value={searchTerm} />
        <IconContainer icon="mdi:search" class="ml-auto" width={24} />
      </div>
    </div>
    <div class="w-full flex flex-row place-content-start mt-1 px-4 pb-0 flex-wrap gap-1">
      <div class="mobile-sizing">
        <LanguageCodeTypeahead bind:langCode inputClasses="w-full max-w-xs" />
      </div>
      <select
        class="select select-bordered mobile-sizing max-w-full"
        bind:value={productDefinitionFilter}
      >
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
      {#each filteredProjects.sort( (a, b) => (a.Name ?? '').localeCompare(b.Name ?? '', languageTag()) ) as project}
        <ProjectCard {project} />
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.projectTable_empty()}</p>
  {/if}
</div>

<style lang="postcss">
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
  .mobile-sizing {
    @apply w-full max-w-xs;
  }
  @media screen(md) {
    .mobile-sizing {
      @apply w-auto max-w-none;
    }
  }
</style>

<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import 'flatpickr/dist/flatpickr.css';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import type { PageData } from './$types';
  import type { PrunedProject } from '$lib/projects/common';
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { FormResult } from 'sveltekit-superforms';
  import { writable } from 'svelte/store';
  export let data: PageData;

  const projects = writable(data.projects);
  const count = writable(data.count);

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onChange(event) {
      if (
        !(
          event.paths.includes('page.size') ||
          event.paths.includes('langCode') ||
          event.paths.includes('search')
        )
      ) {
        submit();
      }
    },
    onUpdate(event) {
      const data = event.result.data as FormResult<{
        query: { data: PrunedProject[]; count: number };
      }>;
      if (event.form.valid && data.query) {
        projects.set(data.query.data);
        count.set(data.query.count);
      }
    }
  });
</script>

<div class="w-full max-w-6xl mx-auto relative px-2 pt-4">
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    on:keydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <div
      class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center px-4 gap-1 mobile-sizing"
    >
      <div class="inline-block grow mobile-sizing">
        <h1 class="py-4 px-2">{m.sidebar_projectDirectory()}</h1>
      </div>
      <div class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center gap-1 mobile-sizing">
        <select class="select select-bordered mobile-sizing" bind:value={$form.organizationId}>
          <option value={null} selected>{m.org_allOrganizations()}</option>
          {#each data.organizations as organization}
            <option value={organization.Id}>{organization.Name}</option>
          {/each}
        </select>
        <SearchBar bind:value={$form.search} className="w-full max-w-xs md:w-auto md:max-w-none" tooltip={m.directory_searchHelp()} />
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-1 place-content-start px-4 pt-1 mobile-sizing">
      <div class="mobile-sizing">
        <LanguageCodeTypeahead
          bind:langCode={$form.langCode}
          on:langCodeSelected={() => submit()}
          inputClasses="w-full max-w-xs"
        />
      </div>
      <select class="select select-bordered max-w-full" bind:value={$form.productDefinitionId}>
        <option value={null} selected>{m.productDefinitions_filterAllProjects()}</option>
        {#each data.productDefinitions as pD}
          <option value={pD.Id}>{pD.Name}</option>
        {/each}
      </select>
      <DateRangePicker
        bind:chosenDates={$form.dateUpdatedRange}
        placeholder={m.directory_filters_dateRange()}
      />
    </div>
  </form>
  {#if $projects.length > 0}
    <div class="w-full relative p-4">
      {#each $projects as project}
        <ProjectCard {project} />
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.projectTable_empty()}</p>
  {/if}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    on:keydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <div class="w-full flex flex-row place-content-start p-4 space-between-4 flex-wrap gap-1">
      <Pagination bind:size={$form.page.size} total={$count} bind:page={$form.page.page} />
    </div>
  </form>
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

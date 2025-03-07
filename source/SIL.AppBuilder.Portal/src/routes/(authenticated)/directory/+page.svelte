<script lang="ts">
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import OrganizationDropdown from '$lib/components/OrganizationDropdown.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import type { PrunedProject } from '$lib/projects/common';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import { byName } from '$lib/utils';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let projects = $state(data.projects);
  let count = $state(data.count);

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onChange(event) {
      if (!(event.paths.includes('langCode') || event.paths.includes('search'))) {
        submit();
      }
    },
    onUpdate(event) {
      const data = event.result.data as FormResult<{
        query: { data: PrunedProject[]; count: number };
      }>;
      if (event.form.valid && data.query) {
        projects = data.query.data;
        count = data.query.count;
      }
    }
  });

  const mobileSizing = 'w-full max-w-xs md:w-auto md:max-w-none';
</script>

<div class="w-full max-w-6xl mx-auto relative px-2 pt-4">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    onkeydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <div
      class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center px-4 gap-1 {mobileSizing}"
    >
      <div class="inline-block grow {mobileSizing}">
        <h1 class="py-4 px-2">{m.sidebar_projectDirectory()}</h1>
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center gap-1 {mobileSizing}"
      >
        <OrganizationDropdown
          className={mobileSizing}
          organizations={data.organizations}
          bind:value={$form.organizationId}
          allowNull={true}
        />
        <SearchBar
          bind:value={$form.search}
          className={mobileSizing}
          tooltip={m.directory_searchHelp()}
        />
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-1 place-content-start px-4 pt-1 {mobileSizing}">
      <div class={mobileSizing}>
        <LanguageCodeTypeahead
          bind:langCode={$form.langCode}
          onLangCodeSelected={() => submit()}
          inputClasses="w-full max-w-xs"
        />
      </div>
      <select class="select select-bordered max-w-full" bind:value={$form.productDefinitionId}>
        <option value={null} selected>{m.productDefinitions_filterAllProjects()}</option>
        {#each data.productDefinitions.toSorted((a, b) => byName(a, b, languageTag())) as pD}
          <option value={pD.Id}>{pD.Name}</option>
        {/each}
      </select>
      <DateRangePicker
        bind:chosenDates={$form.dateUpdatedRange}
        placeholder={m.directory_filters_dateRange()}
      />
    </div>
  </form>
  {#if projects.length > 0}
    <div class="w-full relative p-4">
      {#each projects as project}
        <ProjectCard project={project} route='directory' />
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.projectTable_empty()}</p>
  {/if}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    onkeydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <div class="w-full flex flex-row place-content-start p-4 space-between-4 flex-wrap gap-1">
      <Pagination bind:size={$form.page.size} total={count} bind:page={$form.page.page} />
    </div>
  </form>
</div>

<style lang="postcss">
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

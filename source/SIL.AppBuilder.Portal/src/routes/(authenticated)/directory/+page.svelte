<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import 'flatpickr/dist/flatpickr.css';
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import type { PrunedProject } from '../projects/common';
  import DateRangePicker from '$lib/components/DateRangePicker.svelte';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import Pagination from '$lib/components/forms/Pagination.svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { FormResult } from 'sveltekit-superforms';
  import { writable } from 'svelte/store';
  import ProjectCard from '../projects/components/ProjectCard.svelte';
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

<div class="w-full max-w-6xl mx-auto relative px-2">
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form
    method="POST"
    action="?/page"
    use:enhance
    on:keydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
      <div class="inline-block">
        <h1 class="p-4 pl-6">{m.sidebar_projectDirectory()}</h1>
      </div>
      <div class="flex flex-row place-content-end items-center">
        <select class="select select-bordered ml-2" bind:value={$form.organizationId}>
          <option value={null} selected>{m.org_allOrganizations()}</option>
          {#each data.organizations as organization}
            <option value={organization.Id}>{organization.Name}</option>
          {/each}
        </select>
        <div class="p-4 relative">
          <input
            type="text"
            class="input w-full input-bordered pr-9"
            placeholder={m.search()}
            bind:value={$form.search}
          />
          <div class="absolute right-6 items-center align-middle h-full [top:1.7rem]">
            <IconContainer icon="mdi:search" width={24} />
          </div>
        </div>
      </div>
    </div>
    <div class="w-full flex flex-row place-content-start p-4 pb-0 space-between-4 flex-wrap gap-1">
      <LanguageCodeTypeahead bind:langCode={$form.langCode} on:langCodeSelected={() => submit()} />
      <select class="select select-bordered max-w-full" bind:value={$form.productDefinitionId}>
        <!-- TODO: i18n -->
        <option value={null} selected>Any product definitions</option>
        {#each $page.data.productDefinitions as pD}
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

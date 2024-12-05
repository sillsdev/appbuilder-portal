<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PrunedProject } from '$lib/projects/common';
  import { canModifyProject } from '$lib/projects/common';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
  import { writable } from 'svelte/store';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;

  let selectedProjects: { Id: number; OwnerId: number; Archived: boolean }[] = [];

  const projects = writable(data.projects);
  const count = writable(data.count);

  const {
    form: pageForm,
    enhance: pageEnhance,
    submit: pageSubmit
  } = superForm(data.pageForm, {
    dataType: 'json',
    resetForm: false,
    onChange(event) {
      if (!(event.paths.includes('langCode') || event.paths.includes('search'))) {
        pageSubmit();
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

  afterNavigate((navigation) => {
    projects.set(data.projects);
    count.set(data.count);
    $pageForm.organizationId = data.pageForm.data.organizationId;
  });

  $: canArchive = selectedProjects.reduce(
    (p, c) =>
      p &&
      !c.Archived &&
      canModifyProject($page.data.session!, c.OwnerId, parseInt($page.params.id)),
    true
  );
  $: canReactivate = selectedProjects.reduce(
    (p, c) =>
      p &&
      c.Archived &&
      canModifyProject($page.data.session!, c.OwnerId, parseInt($page.params.id)),
    true
  );

  const {
    form: actionForm,
    enhance: actionEnhance,
    submit: actionSubmit
  } = superForm(data.actionForm, {
    dataType: 'json',
    invalidateAll: true,
    onChange: (event) => {
      if (
        event.paths.includes('operation') &&
        $actionForm.projects.length > 0 &&
        $actionForm.operation
      ) {
        actionSubmit();
      }
    }
  });

  $: $actionForm.projects = selectedProjects;
</script>

<div class="w-full max-w-6xl mx-auto relative px-2">
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form
    method="POST"
    action="?/page"
    use:pageEnhance
    on:keydown={(event) => {
      if (event.key === 'Enter') pageSubmit();
    }}
  >
    <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
      <div class="inline-block">
        <ProjectFilterSelector />
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center mx-4 mobile-sizing gap-1"
      >
        <select
          class="select select-bordered mobile-sizing"
          bind:value={$pageForm.organizationId}
          on:change={() => goto($pageForm.organizationId + '')}
        >
          {#each data.organizations as organization}
            <option value={organization.Id} selected={$pageForm.organizationId === organization.Id}>
              {organization.Name}
            </option>
          {/each}
        </select>
        <SearchBar
          bind:value={$pageForm.search}
          className="w-full max-w-xs md:w-auto md:max-w-none"
        />
      </div>
    </div>
  </form>
  <div class="w-full flex flex-row flex-wrap place-content-between gap-1 mt-4">
    <form
      class="flex flex-row flex-wrap mobile-sizing gap-1 mx-4"
      method="POST"
      action="?/archive"
      use:actionEnhance
    >
      {#if data.allowArchive && (!selectedProjects.length || canArchive)}
        <label class="action btn btn-outline {!selectedProjects.length ? 'btn-disabled' : ''}">
          {m.common_archive()}
          <input
            class="hidden"
            type="radio"
            bind:group={$actionForm.operation}
            value="archive"
            disabled={!selectedProjects.length}
          />
        </label>
      {/if}
      {#if data.allowReactivate && (!selectedProjects.length || canReactivate)}
        <label class="action btn btn-outline {!selectedProjects.length ? 'btn-disabled' : ''}">
          {m.common_reactivate()}
          <input
            class="hidden"
            type="radio"
            bind:group={$actionForm.operation}
            value="reactivate"
            disabled={!selectedProjects.length}
          />
        </label>
      {/if}
      <button
        class="action btn btn-outline"
        disabled={!selectedProjects.length}
        on:click={() => alert('TODO api proxy')}
      >
        {m.common_rebuild()}
      </button>
    </form>
    <div class="flex flex-row flex-wrap mobile-sizing gap-1 mx-4">
      <button
        class="action btn btn-outline"
        on:click={() => goto(`/projects/import/${$pageForm.organizationId}`)}
      >
        {m.project_importProjects()}
      </button>
      <button
        class="action btn btn-outline"
        on:click={() => goto(`/projects/new/${$pageForm.organizationId}`)}
      >
        {m.sidebar_addProject()}
      </button>
    </div>
  </div>
  {#if $projects.length > 0}
    <div class="w-full relative p-4">
      {#each $projects as project}
        <ProjectCard {project}>
          <span slot="checkbox">
            <input
              type="checkbox"
              class="mr-2 checkbox checkbox-info"
              bind:group={selectedProjects}
              value={{ Id: project.Id, OwnerId: project.OwnerId, Archived: !!project.DateArchived }}
            />
          </span>
        </ProjectCard>
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.projectTable_empty()}</p>
  {/if}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form
    method="POST"
    action="?/page"
    use:pageEnhance
    on:keydown={(event) => {
      if (event.key === 'Enter') pageSubmit();
    }}
  >
    <div class="w-full flex flex-row place-content-start p-4 space-between-4 flex-wrap gap-1">
      <Pagination bind:size={$pageForm.page.size} total={$count} bind:page={$pageForm.page.page} />
    </div>
  </form>
</div>

<style lang="postcss">
  .mobile-sizing {
    @apply w-full max-w-xs;
  }
  @media screen(md) {
    .mobile-sizing {
      @apply w-auto max-w-none;
    }
  }
  .action {
    @apply form-control w-full max-w-xs;
  }
  /* This is perfectly valid. I don't have a way to make the error disappear */
  @media screen(sm) {
    .action {
      @apply w-auto max-w-none;
    }
  }
</style>

<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { ProjectForAction, PrunedProject } from '$lib/projects/common';
  import { canArchive, canReactivate } from '$lib/projects/common';
  import ProjectActionMenu from '$lib/projects/components/ProjectActionMenu.svelte';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;

  const {
    form: pageForm,
    enhance: pageEnhance,
    submit: pageSubmit
  } = superForm(data.pageForm, {
    dataType: 'json',
    resetForm: false,
    invalidateAll: false,
    onChange(event) {
      if (!(event.paths.includes('langCode') || event.paths.includes('search'))) {
        pageSubmit();
      }
    },
    onUpdate(event) {
      const returnedData = event.result.data as FormResult<{
        query: { data: PrunedProject[]; count: number };
      }>;
      if (event.form.valid && returnedData.query) {
        data.projects = returnedData.query.data;
        data.count = returnedData.query.count;
      }
    }
  });

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
        $actionForm.operation &&
        $actionForm.projects.length
      ) {
        actionSubmit();
      }
      if (event.paths.includes('projects')) {
        $actionForm.projectId = null;
      }
    }
  });

  let selectedProjects: ProjectForAction[] = [];

  $: selectedProjects = data.projects.filter((p) => $actionForm.projects.includes(p.Id));

  afterNavigate((navigation) => {
    $pageForm.organizationId = data.pageForm.data.organizationId;
    selectedProjects = [];
  });

  $: canArchiveSelected = selectedProjects.every((p) =>
    canArchive(p, $page.data.session, parseInt($page.params.id))
  );
  $: canReactivateSelected = selectedProjects.every((p) =>
    canReactivate(p, $page.data.session, parseInt($page.params.id))
  );
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
      action="?/projectAction"
      use:actionEnhance
    >
      <input type="hidden" name="projectId" value={null} />
      {#if data.allowActions && (canArchiveSelected || !selectedProjects.length)}
        <label
          class="action btn btn-outline"
          class:btn-disabled={!(canArchiveSelected && selectedProjects.length)}
        >
          {m.common_archive()}
          <input
            class="hidden"
            type="radio"
            bind:group={$actionForm.operation}
            value="archive"
            disabled={!(canArchiveSelected && selectedProjects.length)}
          />
        </label>
      {/if}
      {#if data.allowReactivate && (canReactivateSelected || !selectedProjects.length)}
        <label
          class="action btn btn-outline"
          class:btn-disabled={!(canReactivateSelected && selectedProjects.length)}
        >
          {m.common_reactivate()}
          <input
            class="hidden"
            type="radio"
            bind:group={$actionForm.operation}
            value="reactivate"
            disabled={!(canReactivateSelected && selectedProjects.length)}
          />
        </label>
      {/if}
      {#if data.allowActions && (canArchiveSelected || !selectedProjects.length)}
        <label
          class="action btn btn-outline"
          class:btn-disabled={!(canArchiveSelected && selectedProjects.length)}
        >
          {m.common_rebuild()}
          <input
            class="hidden"
            type="radio"
            bind:group={$actionForm.operation}
            value="rebuild"
            disabled={!(canArchiveSelected && selectedProjects.length)}
          />
        </label>
      {/if}
    </form>
    {#if $page.params.filter === 'own'}
      <div class="flex flex-row flex-wrap mobile-sizing gap-1 mx-4">
        <a class="action btn btn-outline" href="/projects/import/{$pageForm.organizationId}">
          {m.project_importProjects()}
        </a>
        <a class="action btn btn-outline" href="/projects/new/{$pageForm.organizationId}">
          {m.sidebar_addProject()}
        </a>
      </div>
    {/if}
  </div>
  {#if data.projects.length > 0}
    <div class="w-full relative p-4">
      {#each data.projects as project}
        <ProjectCard {project}>
          <span slot="select">
            <input
              type="checkbox"
              class="mr-2 checkbox checkbox-accent"
              bind:group={$actionForm.projects}
              value={project.Id}
            />
          </span>
          <span slot="actions">
            <ProjectActionMenu
              data={data.actionForm}
              {project}
              allowActions={data.allowActions}
              allowReactivate={data.allowReactivate}
              userGroups={data.userGroups}
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
      <Pagination
        bind:size={$pageForm.page.size}
        total={data.count}
        bind:page={$pageForm.page.page}
      />
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

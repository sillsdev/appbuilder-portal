<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import * as m from '$lib/paraglide/messages';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import { canModifyProject } from '$lib/projects/common';
  import { superForm } from 'sveltekit-superforms';

  export let data: PageData;

  let selectedProjects: { Id: number; OwnerId: number; Archived: boolean }[] = [];
  let selectedOrg = parseInt($page.params.id);
  let searchTerm: string = '';

  $: filteredProjects = data.projects.filter((project) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      project.Name?.toLowerCase().includes(searchTermLower.toLowerCase()) ||
      project.Language?.toLowerCase().includes(searchTermLower) ||
      project.OwnerName?.toLowerCase().includes(searchTermLower) ||
      project.OrganizationName?.toLowerCase().includes(searchTermLower) ||
      project.GroupName?.toLowerCase().includes(searchTermLower)
    );
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

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    invalidateAll: true,
    onChange: (event) => {
      if (event.paths.includes('operation') && $form.projects.length > 0 && $form.operation) {
        submit();
      }
    }
  });

  $: $form.projects = selectedProjects;
</script>

<div class="w-full max-w-6xl mx-auto relative px-2">
  <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
    <div class="inline-block">
      <ProjectFilterSelector />
    </div>
    <div class="flex flex-row place-content-end items-center">
      <select
        class="select select-bordered ml-2"
        bind:value={selectedOrg}
        on:change={() => goto(selectedOrg + '')}
      >
        {#each data.organizations as organization}
          <option value={organization.Id}>{organization.Name}</option>
        {/each}
      </select>
      <div class="p-4 relative">
        <input
          type="text"
          class="input w-full input-bordered pr-9"
          placeholder={m.search()}
          bind:value={searchTerm}
        />
        <div class="absolute right-6 items-center align-middle h-full [top:1.7rem]">
          <IconContainer icon="mdi:search" width={24} />
        </div>
      </div>
    </div>
  </div>
  <div class="w-full flex flex-row flex-wrap place-content-between p-4 pb-0 px-6 space-between-4">
    <form class="flex flex-row flex-wrap" method="POST" action="?/archive" use:enhance>
      {#if data.allowArchive && (!selectedProjects.length || canArchive)}
        <label class="action {!selectedProjects.length ? 'btn-disabled' : ''}">
          {m.common_archive()}
          <input
            class="hidden"
            type="radio"
            bind:group={$form.operation}
            value="archive"
            disabled={!selectedProjects.length}
          />
        </label>
      {/if}
      {#if data.allowReactivate && (!selectedProjects.length || canReactivate)}
        <label class="action {!selectedProjects.length ? 'btn-disabled' : ''}">
          {m.common_reactivate()}
          <input
            class="hidden"
            type="radio"
            bind:group={$form.operation}
            value="reactivate"
            disabled={!selectedProjects.length}
          />
        </label>
      {/if}
      <button
        class="action"
        disabled={!selectedProjects.length}
        on:click={() => alert('TODO api proxy')}
      >
        {m.common_rebuild()}
      </button>
    </form>
    <div class="flex flex-row flex-wrap w-full sm:w-auto">
      <button class="action" on:click={() => goto(`/projects/import/${selectedOrg}`)}>
        {m.project_importProjects()}
      </button>
      <button class="action" on:click={() => goto(`/projects/new/${selectedOrg}`)}>
        {m.sidebar_addProject()}
      </button>
    </div>
  </div>
  {#if filteredProjects.length > 0}
    <div class="w-full relative p-4">
      {#each filteredProjects.sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? '')) as project}
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
</div>

<style lang="postcss">
  .action {
    @apply form-control w-full max-w-xs btn btn-outline m-1;
  }
  /* This is perfectly valid. I don't have a way to make the error disappear */
  @media screen(sm) {
    .action {
      @apply w-auto max-w-none;
    }
  }
</style>

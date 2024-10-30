<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import * as m from '$lib/paraglide/messages';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';

  export let data: PageData;

  let selectedProjects: number[] = [];
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
  <div class="w-full flex flex-row place-content-between p-4 pb-0 px-6 space-between-4">
    <div class="space-y-2">
      <button
        class="btn btn-outline mx-1"
        disabled={!selectedProjects.length}
        on:click={() => alert(selectedProjects.join(', '))}
      >
        {m.common_archive()}
      </button>
      <button class="btn btn-outline mx-1" disabled={!selectedProjects.length}>
        {m.common_rebuild()}
      </button>
    </div>
    <div class="text-right space-y-2">
      <button class="btn btn-outline mx-1" on:click={() => alert('TODO api proxy')}>
        {m.project_importProjects()}
      </button>
      <button class="btn btn-outline mx-1" on:click={() => alert('TODO api proxy')}>
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
              value={project.Id}
            />
          </span>
        </ProjectCard>
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.projectTable_empty()}</p>
  {/if}
</div>

<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import * as m from '$lib/paraglide/messages';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import { languageTag } from '$lib/paraglide/runtime';

  export let data: PageData;

  let selectedProjects: number[] = [];
  let selectedOrg = parseInt($page.params.id);
  let searchTerm: string = '';

  $: filteredProjects = data.projects.filter((project) => {
    const searchTermLower = searchTerm.toLowerCase();
    return [
      project.Name,
      project.Language,
      project.OwnerName,
      project.OrganizationName,
      project.GroupName
    ].some((field) => field?.toLowerCase().includes(searchTermLower));
  });
</script>

<div class="w-full max-w-6xl mx-auto relative px-2">
  <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
    <div class="inline-block">
      <ProjectFilterSelector />
    </div>
    <div
      class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center mx-4 mobile-sizing gap-1"
    >
      <select
        class="select select-bordered mobile-sizing"
        bind:value={selectedOrg}
        on:change={() => goto(selectedOrg + '')}
      >
        {#each data.organizations as organization}
          <option value={organization.Id}>{organization.Name}</option>
        {/each}
      </select>
      <SearchBar bind:value={searchTerm} className="w-full max-w-xs md:w-auto md:max-w-none" />
    </div>
  </div>
  <div class="w-full flex flex-row flex-wrap place-content-between gap-1 mt-4">
    <div class="flex flex-row flex-wrap mobile-sizing gap-1 mx-4">
      <button
        class="action"
        disabled={!selectedProjects.length}
        on:click={() => alert(selectedProjects.join(', '))}
      >
        {m.common_archive()}
      </button>
      <button class="action" disabled={!selectedProjects.length}>
        {m.common_rebuild()}
      </button>
    </div>
    <div class="flex flex-row flex-wrap mobile-sizing gap-1 mx-4">
      <button class="action" on:click={() => alert('TODO api proxy')}>
        {m.project_importProjects()}
      </button>
      <button class="action" on:click={() => alert('TODO api proxy')}>
        {m.sidebar_addProject()}
      </button>
    </div>
  </div>
  {#if filteredProjects.length > 0}
    <div class="w-full relative p-4">
      {#each filteredProjects.sort( (a, b) => (a.Name ?? '').localeCompare(b.Name ?? '', languageTag()) ) as project}
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
    @apply form-control w-full max-w-xs btn btn-outline;
  }
  /* This is perfectly valid. I don't have a way to make the error disappear */
  @media screen(sm) {
    .action {
      @apply w-auto max-w-none;
    }
  }
</style>

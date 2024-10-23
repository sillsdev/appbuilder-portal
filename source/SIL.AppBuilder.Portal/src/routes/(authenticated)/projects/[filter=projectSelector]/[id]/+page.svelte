<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PrunedProject } from '$lib/projects/common';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
  import { writable } from 'svelte/store';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;

  let selectedProjects: number[] = [];

  const projects = writable(data.projects);
  const count = writable(data.count);

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
        projects.set(data.query.data);
        count.set(data.query.count);
      }
    }
  });

  afterNavigate((navigation) => {
    projects.set(data.projects);
    count.set(data.count);
    $form.organizationId = data.form.data.organizationId;
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
        <ProjectFilterSelector />
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center mx-4 mobile-sizing gap-1"
      >
        <select
          class="select select-bordered mobile-sizing"
          bind:value={$form.organizationId}
          on:change={() => goto($form.organizationId + '')}
        >
          {#each data.organizations as organization}
            <option value={organization.Id} selected={$form.organizationId === organization.Id}>
              {organization.Name}
            </option>
          {/each}
        </select>
        <SearchBar bind:value={$form.search} className="w-full max-w-xs md:w-auto md:max-w-none" />
      </div>
    </div>
  </form>
  <div class="w-full flex flex-row flex-wrap place-content-between gap-1 mt-4">
    <div class="flex flex-row flex-wrap mobile-sizing gap-1 mx-4">
      <button
        class="action btn btn-outline"
        disabled={!selectedProjects.length}
        on:click={() => alert('TODO: ' + selectedProjects.join(', '))}
      >
        {m.common_archive()}
      </button>
      <button
        class="action btn btn-outline"
        disabled={!selectedProjects.length}
        on:click={() => alert('TODO api proxy')}
      >
        {m.common_rebuild()}
      </button>
    </div>
    <div class="flex flex-row flex-wrap mobile-sizing gap-1 mx-4">
      <button class="action btn btn-outline" on:click={() => alert('TODO api proxy')}>
        {m.project_importProjects()}
      </button>
      <button class="action btn btn-outline" on:click={() => goto(`/projects/new/${$form.organizationId}`)}>
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
              value={project.Id}
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

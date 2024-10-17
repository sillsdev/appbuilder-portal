<script lang="ts">
  import type { PageData } from './$types';
  import { goto, afterNavigate } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PrunedProject } from '../../common';
  import ProjectFilterSelector from '../../components/ProjectFilterSelector.svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { FormResult } from 'sveltekit-superforms';
  import { writable } from 'svelte/store';
  import ProjectCard from '../../components/ProjectCard.svelte';
  import Pagination from '$lib/components/forms/Pagination.svelte';

  export let data: PageData;

  let selectedProjects: number[] = [];

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
      <div class="flex flex-row place-content-end items-center">
        <select
          class="select select-bordered ml-2"
          bind:value={$form.organizationId}
          on:change={() => goto($form.organizationId + '')}
        >
          {#each data.organizations as organization}
            <option value={organization.Id} selected={$form.organizationId === organization.Id}>
              {organization.Name}
            </option>
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
  </form>
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

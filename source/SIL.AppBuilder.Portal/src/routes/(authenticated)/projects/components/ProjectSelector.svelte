<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import { getTimeDateString } from '$lib/timeUtils';
  import type { PrunedProject } from '../common';
  import ProjectFilterSelector from './ProjectFilterSelector.svelte';

  let selectedProjects: number[] = [];
  export let projects: PrunedProject[];
  let selectedOrg = parseInt($page.params.id);
  let searchTerm: string = '';

  $: filteredProjects = projects.filter((project) => {
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
      <slot name="header">
        <ProjectFilterSelector />
      </slot>
    </div>
    <div class="flex flex-row place-content-end items-center">
      {#if $page.params.id}
        <select
          class="select select-bordered ml-2"
          bind:value={selectedOrg}
          on:change={() => goto(selectedOrg + '')}
        >
          {#each $page.data.organizations as organization}
            <option value={organization.Id}>{organization.Name}</option>
          {/each}
        </select>
      {/if}
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
  <slot name="options">
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
        <button class="btn btn-outline mx-1">{m.project_importProjects()}</button>
        <button class="btn btn-outline mx-1">{m.sidebar_addProject()}</button>
      </div>
    </div>
  </slot>
  {#if projects.length > 0}
    <div class="w-full relative p-4">
      {#each filteredProjects.sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? '')) as project}
        <div class="rounded-md bg-base-300 border border-slate-400 my-4 overflow-hidden w-full">
          <div class="p-4 pb-2 w-full">
            <span class="flex flex-row">
              {#if !$$slots.options}
                <input
                  type="checkbox"
                  class="mr-2 checkbox checkbox-info"
                  bind:group={selectedProjects}
                  value={project.Id}
                />
              {/if}
              <a href="/projects/{project.Id}">
                <b class="[color:#55f]">
                  {project.Name}
                </b>
              </a>
              <div class="grow" />
              <span
                class="ml-8 badge badge-primary mb-2 mr-4 [height:1.35rem]"
                title={m.projectTable_columns_language()}
              >
                <IconContainer icon="ph:globe" width={20} class="mr-1" />
                <!-- <LanguageIconContainer color="lightgray" size="20" /> -->
                <span class="w-6 overflow-hidden text-center">
                  {project.Language}
                </span>
              </span>

              <!-- Removed on request from Chris -->
              <!-- <IconContainer icon="charm:menu-kebab" width={20} class="inline float-right" /> -->
            </span>
            <div class="flex flex-wrap justify-between">
              <div class="mr-2">
                <span class="flex items-center" title={m.projectTable_columns_owner()}>
                  <IconContainer icon="mdi:user" width={20} class="mr-1 shrink-0" />
                  {project.OwnerName}
                </span>
                <span class="flex items-center" title={m.projectTable_columns_organization()}>
                  <IconContainer
                    icon="clarity:organization-solid"
                    width={20}
                    class="mr-1 shrink-0"
                  />
                  {project.OrganizationName}
                </span>
                <span
                  class="flex items-center [margin-right:0]"
                  title={m.projectTable_columns_group()}
                >
                  <IconContainer icon="mdi:account-group" width={20} class="mr-1 shrink-0" />
                  <span class=" text-nowrap">
                    {project.GroupName}
                  </span>
                </span>
              </div>
              <div>
                <span class="flex items-center" title={m.projectTable_columns_updatedOn()}>
                  <span class="text-nowrap overflow-hidden text-center mr-1">
                    {m.projectTable_columns_updatedOn()}:
                  </span>
                  <span class="w-40 text-center">
                    {getTimeDateString(project.DateUpdated)}
                  </span>
                </span>
                <span class="flex items-center" title={m.projectTable_columns_activeSince()}>
                  <span class="overflow-hidden text-nowrap mr-1">
                    {m.projectTable_columns_activeSince()}:
                  </span>
                  <span class="text-nowrap w-40 text-center">
                    {getTimeDateString(project.DateActive)}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div class="w-full bg-base-100 p-4 pt-2">
            {#if project.Products.length > 0}
              <table class="w-full">
                <thead>
                  <tr class="text-left">
                    <th>{m.projectTable_products()}</th>
                    <th>{m.projectTable_columns_buildVersion()}</th>
                    <th>{m.projectTable_columns_buildDate()}</th>
                  </tr>
                </thead>
                <tbody>
                  {#each project.Products as product}
                    <tr>
                      <td class="p-2">
                        <div class="flex items-center">
                          <IconContainer
                            icon={getIcon(product.ProductDefinitionName ?? '')}
                            width={30}
                          />
                          {product.ProductDefinitionName}
                        </div>
                      </td>
                      <td>
                        {product.VersionBuilt ?? '-'}
                      </td>
                      <td>
                        {getTimeDateString(product.DateBuilt)}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              <p>{m.projectTable_noProducts()}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.projectTable_empty()}</p>
  {/if}
</div>

<style>
  tr:not(:last-child) {
    border-bottom: 1px solid gray;
  }
</style>

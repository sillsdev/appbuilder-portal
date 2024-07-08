<script lang="ts">
  import { page } from '$app/stores';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import Icon from '@iconify/svelte';
  import type { PrunedProject } from '../common';

  const textsForPaths = new Map([
    ['all', m.projects_switcher_dropdown_all()],
    ['own', m.projects_switcher_dropdown_myProjects()],
    ['organization', m.projects_switcher_dropdown_orgProjects()],
    ['active', m.projects_switcher_dropdown_activeProjects()],
    ['archived', m.projects_switcher_dropdown_archived()]
  ]);
  let selectedProjects = [];
  export let projects: PrunedProject[];
</script>

<div class="w-full max-w-6xl mx-auto relative px-2">
  <div class="flex flex-row place-content-between w-full items-center">
    <div class="dropdown dropdown-start">
      <!-- When .dropdown is focused, .dropdown-content is revealed making this actually interactive -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <h1 tabindex="0" class="pl-4 py-2">
        <div class="flex flex-row items-center">
          {textsForPaths.get($page.params.filter)}
          <div class="dropdown-icon">
            <Icon width="24" class="dropdown-icon" icon="gridicons:dropdown" />
          </div>
        </div>
      </h1>
      <div class="dropdown-content z-10 overflow-y-auto left-2">
        <div class="p-2 border m-2 rounded-md bg-base-200 px-4">
          {#each textsForPaths as route}
            <!-- Little hack. If the path is "own" or "all" we don't need an id and they happen to be 3 chars and the others aren't -->
            <a
              href="/projects/{route[0]}{route[0].length > 3 && $page.params.id
                ? '/' + $page.params.id
                : ''}"
              class:font-extrabold={$page.params.filter === route[0]}
              class="p-1 text-nowrap block">{route[1]}</a
            >
          {/each}
        </div>
      </div>
    </div>
    <div class="w-1/3 p-4">
      <input type="text" class="input w-full input-bordered pr-9" placeholder={m.search()} />
      <div class="absolute right-8 items-center align-middle h-full top-7">
        <Icon icon="mdi:search" height="24" />
      </div>
    </div>
  </div>
  <div class="w-full flex flex-row place-content-between p-4 px-6 space-between-4">
    <div>
      <button class="btn btn-outline mx-1">{m.common_archive()}</button>
      <button class="btn btn-outline mx-1">{m.common_rebuild()}</button>
    </div>
    <div>
      <button class="btn btn-outline mx-1">{m.project_importProjects()}</button>
      <button class="btn btn-outline mx-1">{m.sidebar_addProject()}</button>
    </div>
  </div>
  {#if projects.length > 0}
    <div class="w-full relative p-4">
      {#each projects.sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? '')) as project}
        <div class="rounded-md bg-base-300 border border-current my-4 overflow-hidden w-full">
          <div class="p-4 pb-2 w-full">
            <span class="flex flex-row">
              <input
                type="checkbox"
                class="mr-2"
                bind:group={selectedProjects}
                value={project.Id}
              />
              <a href="/projects/{project.Id}">
                <b class="[color:#44f]">
                  {project.Name}
                </b>
              </a>
              <div class="grow" />
              <span
                class="ml-8 flex items-center bg-primary [color:black] rounded-xl px-1 mb-2 mr-4"
                title={m.projectTable_columns_language()}
              >
                <Icon icon="ph:globe" width="20" class="mr-1" />
                <!-- <LanguageIcon color="lightgray" size="20" /> -->
                <span class="w-6 overflow-hidden text-center">
                  {project.Language}
                </span>
              </span>
              <Icon icon="charm:menu-kebab" height="20" class="inline float-right" />
            </span>
            <div class="flex flex-wrap projectinfo justify-between">
              <div class="mr-2">
                <span class="flex items-center" title={m.projectTable_columns_owner()}>
                  <Icon icon="mdi:user" width="20" class="mr-1 shrink-0" />
                  {project.OwnerName}
                </span>
                <span class="flex items-center" title={m.projectTable_columns_organization()}>
                  <Icon icon="clarity:organization-solid" width="20" class="mr-1 shrink-0" />
                  {project.OrganizationName}
                </span>
                <span
                  class="flex items-center [margin-right:0]"
                  title={m.projectTable_columns_group()}
                >
                  <Icon icon="mdi:account-group" width="20" class="mr-1 shrink-0" />
                  <span class=" text-nowrap">
                    {project.GroupName}
                  </span>
                </span>
              </div>
              <div>
                <span class="flex items-center" title={m.projectTable_columns_updatedOn()}>
                  <span class="text-nowrap overflow-hidden text-center mr-1">
                    {m.projectTable_columns_updatedOn()}:
                  </span><span class="w-36 text-center">
                    {project.DateUpdated?.toLocaleDateString()}
                    {project.DateUpdated?.toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }).replace(' ', '\xa0') ?? ''}
                  </span>
                </span>
                <span class="flex items-center" title={m.projectTable_columns_activeSince()}>
                  <span class="overflow-hidden text-nowrap mr-1">
                    {m.projectTable_columns_activeSince()}:
                  </span><span class="text-nowrap w-36 text-center">
                    {project.DateActive?.toLocaleDateString() ?? '-'}
                    {project.DateActive?.toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }).replace(' ', '\xa0') ?? ''}
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
                        <Icon
                          class="inline"
                          icon={getIcon(product.ProductDefinitionName ?? '')}
                          width="30"
                        />
                        {product.ProductDefinitionName}
                      </td>
                      <td>
                        {product.VersionBuilt ?? '-'}
                      </td>
                      <td>
                        {product.DateBuilt?.toLocaleDateString() ?? '-'}
                        {product.DateBuilt?.toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }).replace(' ', '\xa0') ?? ''}
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
    <p class="m-4">{m.projectTable_empty()}</p>
  {/if}
</div>

<style>
  .dropdown-icon {
    transition: transform 0.15s;
    transform: rotate(0deg);
  }
  .dropdown:focus-within .dropdown-icon {
    transform: rotate(180deg);
  }
  tr:not(:last-child) {
    border-bottom: 1px solid gray;
  }
</style>

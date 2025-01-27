<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import { getTimeDateString } from '$lib/timeUtils';
  import type { PrunedProject } from '../common';

  export let project: PrunedProject;
</script>

<div class="rounded-md bg-base-300 border border-slate-400 my-4 overflow-hidden w-full">
  <div class="p-4 pb-2 w-full">
    <span class="flex flex-row">
      <slot name="select" />
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
      <slot name="actions" />
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

<style>
  tr:not(:last-child) {
    border-bottom: 1px solid gray;
  }
</style>
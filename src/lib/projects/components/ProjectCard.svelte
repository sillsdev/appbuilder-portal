<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import type { PrunedProject } from '$lib/projects';
  import { byString } from '$lib/utils/sorting';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    project: PrunedProject;
    route?: string;
    select?: Snippet;
    actions?: Snippet;
  }

  let { project, route = 'projects', select, actions }: Props = $props();
</script>

{#snippet langIcon(lang: string | null)}
  {#if lang}
    <span class="badge badge-primary mb-2 mr-4 [height:1.35rem]" title={m.projectTable_language()}>
      <IconContainer icon="ph:globe" width={20} class="mr-1" />
      <!-- <LanguageIconContainer color="lightgray" size="20" /> -->
      <span class="overflow-auto text-center">
        {lang}
      </span>
    </span>
  {/if}
{/snippet}

<div class="rounded-md bg-neutral border border-slate-400 my-4 overflow-hidden w-full">
  <div class="p-4 pb-2 w-full">
    <span class="flex flex-row">
      {@render select?.()}
      <div class="flex flex-row flex-wrap grow">
        <a href={localizeHref(`/${route}/${project.Id}`)}>
          <b class="[color:#55f]">
            {project.Name}
          </b>
        </a>
        <div class="grow"></div>
        <span class="hidden sm:inline">{@render langIcon(project.Language)}</span>
      </div>
      {@render actions?.()}
    </span>
    <div class="mt-2 sm:hidden">{@render langIcon(project.Language)}</div>
    <div class="flex flex-wrap justify-between">
      <div class="mr-2">
        <span class="flex items-center" title={m.projectTable_owner()}>
          <IconContainer icon="mdi:user" width={20} class="mr-1 shrink-0" />
          {project.OwnerName}
        </span>
        <span class="flex items-center" title={m.projectTable_org()}>
          <IconContainer icon="clarity:organization-solid" width={20} class="mr-1 shrink-0" />
          {project.OrganizationName}
        </span>
        <span class="flex items-center [margin-right:0]" title={m.projectTable_group()}>
          <IconContainer icon="mdi:account-group" width={20} class="mr-1 shrink-0" />
          <span class=" text-nowrap">
            {project.GroupName}
          </span>
        </span>
      </div>
      <div>
        <span class="flex items-center" title={m.projectTable_updatedOn()}>
          <span class="text-nowrap overflow-hidden text-center mr-1">
            {m.projectTable_updatedOn()}:
          </span>
          <span class="w-40 text-center">
            {getTimeDateString(project.DateUpdated)}
          </span>
        </span>
        <span class="flex items-center" title={m.projectTable_activeSince()}>
          <span class="overflow-hidden text-nowrap mr-1">
            {m.projectTable_activeSince()}:
          </span>
          <span class="text-nowrap w-40 text-center">
            {getTimeDateString(project.DateActive)}
          </span>
        </span>
        {#if project.DateArchived}
          <span class="flex items-center" title={m.projectTable_archivedOn()}>
            <span class="overflow-hidden text-nowrap mr-1">
              {m.projectTable_archivedOn()}:
            </span>
            <span class="text-nowrap w-40 text-center">
              {getTimeDateString(project.DateArchived)}
            </span>
          </span>
        {/if}
      </div>
    </div>
  </div>
  <div class="w-full bg-base-100 p-4 pt-2">
    {#if project.Products.length > 0}
      {@const locale = getLocale()}
      <table class="w-full sm:hidden">
        <thead>
          <tr class="text-left">
            <th colspan="2">{m.projectTable_products()}</th>
          </tr>
        </thead>
        <tbody>
          {#each project.Products.toSorted( (a, b) => byString(a.ProductDefinitionName, b.ProductDefinitionName, locale) ) as product}
            <tr>
              <td class="py-2" colspan="2">
                <div class="flex items-center">
                  <IconContainer icon={getIcon(product.ProductDefinitionName ?? '')} width={30} />
                  {product.ProductDefinitionName}
                </div>
              </td>
            </tr>
            <tr>
              <th class="text-left opacity-75">{m.projectTable_appBuilderVersion()}</th>
              <td>
                {product.AppBuilderVersion ?? '-'}
              </td>
            </tr>
            <tr class="text-left opacity-75">
              <th>{m.projectTable_buildVersion()}</th>
              <th>{m.projectTable_buildDate()}</th>
            </tr>
            <tr class="row">
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
      <table class="w-full hidden sm:table">
        <thead>
          <tr class="text-left">
            <th>{m.projectTable_products()}</th>
            <th>{m.projectTable_buildVersion()}</th>
            <th>{m.projectTable_buildDate()}</th>
            <th>{m.projectTable_appBuilderVersion()}</th>
          </tr>
        </thead>
        <tbody>
          {#each project.Products.toSorted( (a, b) => byString(a.ProductDefinitionName, b.ProductDefinitionName, locale) ) as product}
            <tr class="row">
              <td class="p-2">
                <div class="flex items-center">
                  <IconContainer icon={getIcon(product.ProductDefinitionName ?? '')} width={30} />
                  {product.ProductDefinitionName}
                </div>
              </td>
              <td>
                {product.VersionBuilt ?? '-'}
              </td>
              <td>
                {getTimeDateString(product.DateBuilt)}
              </td>
              <td>
                {product.AppBuilderVersion ?? '-'}
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
  :where(thead tr, tbody tr:where(.row):not(:last-child)) {
    @supports (color: color-mix(in lab, red, red)) {
      /* Copied from DaisyUI source. Modified opacity */
      border-bottom: var(--border) solid color-mix(in oklch, var(--color-base-content) 25%, #0000);
    }
  }

  tr:where(.row) > td {
    padding-bottom: var(--spacing);
  }
</style>

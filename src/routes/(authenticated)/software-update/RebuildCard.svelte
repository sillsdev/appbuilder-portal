<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import type { RebuildItem } from '$lib/software-updates/sse';
  import { byString } from '$lib/utils/sorting';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    rebuild: RebuildItem;
  }

  let { rebuild }: Props = $props();

  const locale = getLocale();
</script>

<div class="rounded-md bg-neutral border border-slate-400 my-6 overflow-hidden w-full">
  <div class="p-4 pb-2 w-full">
    <div class="flex flex-wrap justify-between p-2">
      <div class="mr-2">
        <span class="flex items-center mb-1">
          <IconContainer icon="clarity:organization-solid" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">{m.admin_software_update_organization_title()}:</span>
          {rebuild.Organization.Name ?? ''}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon="mdi:user" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">{m.admin_software_update_initiated_by()}:</span>
          {rebuild.InitiatedBy.Name ?? ''}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon="mdi:application" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">
            {m.admin_software_update_application_type_title()}:
          </span>
          {rebuild.ApplicationType.Name ?? ''}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon="mdi:tag" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">{m.admin_software_update_version_title()}:</span>
          {rebuild.Version ?? ''}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon="mdi:package-variant" width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">{m.admin_software_update_products_title()}:</span>
          {rebuild._count.Products}
        </span>
      </div>
      <div class="items-start">
        <span class="flex items-center">
          <span class="text-nowrap overflow-hidden text-center mr-1">
            <IconContainer icon="mdi:calendar-plus" width={20} class=" shrink-0" />
            <span class="font-semibold">{m.admin_software_update_created_title()}:</span>
          </span>
          <span class="w-40 text-center">{getTimeDateString(rebuild.DateCreated)}</span>
        </span>

        {#if rebuild.DateCompleted}
          <span class="flex items-center">
            <span class="overflow-hidden text-nowrap mr-1">
              <IconContainer icon="mdi:calendar-check" width={20} class="shrink-0" />
              <span class="font-semibold">{m.admin_software_update_status_completed()}:</span>
            </span>
            <span class="text-nowrap w-40 text-center">
              {getTimeDateString(rebuild.DateCompleted)}
            </span>
          </span>
        {/if}
      </div>
    </div>
    <div class="text-sm opacity-75 pl-2">
      <span class="flex items-center">
        <span class="overflow-hidden text-nowrap">
          {m.admin_nav_software_update_comment()}:
        </span>
        <span class="text-nowrap w-40 text-left ml-2">
          {rebuild.Comment ?? ''}
        </span>
      </span>
    </div>
  </div>

  <div class="w-full bg-base-100 p-6 pt-2">
    {#if rebuild.Projects.length > 0}
      <div class="mb-2">
        <span class="font-semibold">{m.admin_software_update_projects_title()}:</span>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each rebuild.Projects.toSorted((a, b) => byString(a.Name, b.Name, locale)) as project}
          <a
            href={`/projects/${project.Id}`}
            class="badge badge-primary badge-lg hover:badge-accent transition-colors"
          >
            {project.Name ?? ''}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>

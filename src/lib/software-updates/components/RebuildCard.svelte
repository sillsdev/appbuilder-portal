<script lang="ts">
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import type { RebuildItem } from '$lib/software-updates';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    rebuild: RebuildItem;
  }

  let { rebuild }: Props = $props();
</script>

<div class="rounded-md bg-neutral border border-slate-400 my-6 overflow-hidden w-full">
  <div class="p-4 pb-2 w-full">
    <div class="flex flex-wrap justify-between p-2">
      <div class="mr-2">
        <span class="flex items-center mb-1" title={m.admin_software_update_organization_title()}>
          <IconContainer icon={Icons.Organization} width={20} class="mr-1 shrink-0" />
          {rebuild.Organizations.join(',') ?? ''}
        </span>
        <span class="flex items-center mb-1" title={m.admin_software_update_initiated_by()}>
          <IconContainer icon={Icons.User} width={20} class="mr-1 shrink-0" />
          {rebuild.InitiatedBy ?? ''}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon={Icons.Package} width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">{m.admin_software_update_products_title()}:</span>
          {rebuild._count.Products}
        </span>
        <span class="flex items-center mb-1">
          <IconContainer icon={Icons.Directory} width={20} class="mr-1 shrink-0" />
          <span class="font-semibold mr-1">{m.admin_software_update_projects_title()}:</span>
          {rebuild._count.Projects}
        </span>
      </div>
      <div class="items-start flex flex-col">
        <span class="flex items-center" title={m.admin_software_update_created_title()}>
          <span class="text-nowrap overflow-hidden text-center mr-1">
            {m.admin_software_update_created_title()}:
          </span>
          <span class="w-40 text-center">
            {getTimeDateString(rebuild.DateCreated)}
          </span>
        </span>

        {#if rebuild.DateCompleted}
          <span class="flex items-center" title={m.admin_software_update_status_completed()}>
            <span class="text-nowrap overflow-hidden text-center mr-1">
              {m.admin_software_update_status_completed()}:
            </span>
            <span class="w-40 text-center">
              {getTimeDateString(rebuild.DateCompleted)}
            </span>
          </span>
        {/if}
        {#if !rebuild.DateCompleted}
          <form class="mt-auto" method="post" action="?/cancel">
            <input type="hidden" name="rebuildId" value={rebuild.Id} />
            <button type="submit" class="text-nowrap btn btn-secondary btn-sm">
              <IconContainer icon={Icons.CancelOctagon} width={20} />
              {m.common_cancel()}
            </button>
          </form>
        {/if}
      </div>
    </div>
    <div class="text-sm opacity-75 pl-2">
      <TaskComment comment={rebuild.Comment} />
    </div>
  </div>

  <div class="w-full bg-base-100 p-6 pt-2">
    {#if rebuild.Projects.length > 0}
      <div class="mb-2">
        <span class="font-semibold">{m.admin_software_update_projects_title()}:</span>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each rebuild.Projects as project}
          <a
            href={localizeHref(`/projects/${project.Id}`)}
            class="badge badge-primary badge-lg hover:badge-accent transition-colors"
          >
            {project.Name ?? ''}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>

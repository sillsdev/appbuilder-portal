<script lang="ts">
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { getRelativeTime } from '$lib/utils/time';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="w-full">
  <h1>{m.tasks_title()}</h1>
  <div class="m-4 relative mt-0">
    {#if data.tasks.length > 0}
      {@const locale = getLocale()}
      <table class="w-full">
        <thead>
          <tr class="border-b-2 text-left">
            <th>{m.tasks_product()}</th>
            <th>{m.tasks_project()}</th>
            <th>{m.tasks_waitTime()}</th>
          </tr>
        </thead>
        <tbody>
          {#each data.tasks as task}
            <tr
              class="cursor-pointer"
              onclick={() => goto(localizeHref(`/tasks/${task.ProductId}`))}
            >
              <td>
                <span class="flex items-center">
                  <IconContainer
                    icon={getIcon(task.Product.ProductDefinition.Name ?? '')}
                    width={38}
                  />
                  <span>
                    {task.Product.ProductDefinition.Name}
                  </span>
                </span>
                <span
                  class="rounded-xl h-auto badge badge-secondary uppercase font-bold ml-10 [top:-5px] relative mt-2 text-center"
                >
                  {task.Status}
                </span>
              </td>
              <td>
                <a class="link" href={localizeHref(`/projects/${task.Product.ProjectId}`)}>
                  {task.Product.Project.Name}
                </a>
              </td>
              <td>
                <Tooltip tip={task.DateUpdated?.toLocaleString(locale)}>
                  {task.DateUpdated ? getRelativeTime(task.DateUpdated) : 'null'}
                </Tooltip>
              </td>
            </tr>
            {#if task.Comment}
              <tr>
                <td class="pl-7">
                  {#if task.Comment.startsWith('system.')}
                    {#if task.Comment.startsWith('system.build-failed')}
                      <span>
                        {m.system_buildFailed()}
                      </span>
                    {:else if task.Comment.startsWith('system.publish-failed')}
                      <span>
                        {m.system_publishFailed()}
                      </span>
                    {/if}
                    <br />
                    <a
                      class="link link-info"
                      href={task.Comment.replace(/system\.(build|publish)-failed,/, '')}
                      target="_blank"
                    >
                      {m.project_products_publications_console()}
                    </a>
                  {:else}
                    {task.Comment}
                  {/if}
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="pl-4">
        <h3 class="p-0">{m.tasks_noTasksTitle()}</h3>
        <span>{m.tasks_noTasksDescription()}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  thead th {
    padding: 0.75rem;
  }
  tbody td {
    padding: 0.5rem;
  }
  td a:hover {
    text-decoration: underline;
  }
</style>

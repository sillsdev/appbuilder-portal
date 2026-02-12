<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { getProductIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import { userTasksSSE } from '$lib/stores';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const userTasks = $derived($userTasksSSE ?? data.userTasks);

  const dateUpdated = $derived(getRelativeTime(userTasks.map((task) => task.DateUpdated)));
</script>

<div class="w-full">
  <h1>{m.tasks_title()}</h1>
  <div class="m-4 relative mt-0">
    {#if userTasks.length > 0}
      <table class="w-full table-fixed sm:hidden">
        <thead>
          <tr class="border-b-2 text-left">
            <th class="w-1/4">{m.tasks_product()}</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each userTasks as task, i}
            <tr
              class="cursor-pointer no-border"
              onclick={() => goto(localizeHref(`/tasks/${task.ProductId}`))}
            >
              <td colspan="3">
                <span class="flex items-center">
                  <IconContainer
                    icon={getProductIcon(task.Product.ProductDefinition.Workflow.ProductType)}
                    width={38}
                  />
                  <span>
                    {task.Product.ProductDefinition.Name}
                  </span>
                </span>
              </td>
            </tr>
            <tr class="no-border">
              <th class="text-left pl-2">{m.tasks_project()}</th>
              <td colspan="2">
                <a class="link" href={localizeHref(`/projects/${task.Product.ProjectId}`)}>
                  {task.Product.Project.Name}
                </a>
              </td>
            </tr>
            <tr class="cursor-pointer" class:no-border={task.Comment}>
              <td
                colspan="2"
                class="pl-2"
                onclick={() => goto(localizeHref(`/tasks/${task.ProductId}`))}
              >
                <span
                  class="rounded-xl h-auto badge badge-secondary uppercase font-bold [top:-5px] relative mt-2 text-center"
                >
                  {task.Status}
                </span>
              </td>
              <td>
                <Tooltip tip={getTimeDateString(task.DateUpdated)}>
                  {$dateUpdated[i]}
                </Tooltip>
              </td>
            </tr>
            {#if task.Comment}
              <tr>
                <td class="p-0" colspan="3">
                  <TaskComment comment={task.Comment} />
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
      <table class="w-full hidden sm:table">
        <thead>
          <tr class="border-b-2 text-left">
            <th>{m.tasks_product()}</th>
            <th>{m.tasks_project()}</th>
            <th>{m.tasks_waitTime()}</th>
          </tr>
        </thead>
        <tbody>
          {#each userTasks as task, i}
            <tr
              class="cursor-pointer"
              onclick={() => goto(localizeHref(`/tasks/${task.ProductId}`))}
              class:no-border={task.Comment}
            >
              <td>
                <span class="flex items-center">
                  <IconContainer
                    icon={getProductIcon(task.Product.ProductDefinition.Workflow.ProductType)}
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
                <Tooltip tip={getTimeDateString(task.DateUpdated)}>
                  {$dateUpdated[i]}
                </Tooltip>
              </td>
            </tr>
            {#if task.Comment}
              <tr>
                <td class="pl-7 pt-0" colspan="3">
                  <TaskComment comment={task.Comment} />
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
  tbody td,
  th {
    padding-top: 0;
    padding-bottom: 1rem;
  }
  :where(thead tr, tbody tr:not(:last-child)) {
    @supports (color: color-mix(in lab, red, red)) {
      /* Copied from DaisyUI source. Modified opacity */
      border-bottom: var(--border) solid color-mix(in oklch, var(--color-base-content) 25%, #0000);
    }
  }
  .no-border {
    border: none;
  }
</style>

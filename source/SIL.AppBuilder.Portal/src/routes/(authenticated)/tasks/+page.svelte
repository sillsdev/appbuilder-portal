<script lang="ts">
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import { getRelativeTime } from '$lib/timeUtils';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="w-full">
  <h1>{m.tasks_title()}</h1>
  <div class="m-4 relative mt-0">
    {#if data.tasks.length > 0}
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
              on:click={() =>
                goto(
                  `/flow/${task.Product.ProductDefinition.Workflow.WorkflowBusinessFlow}/${task.ProductId}`
                )}
            >
              <td>
                <div>
                  <IconContainer
                    icon={getIcon(task.Product.ProductDefinition.Name ?? '')}
                    width={38}
                  />
                  <span>
                    {task.Product.ProductDefinition.Name}
                  </span>
                </div>
                <span
                  class="rounded-xl badge badge-secondary uppercase font-bold ml-10 [top:-5px] relative"
                >
                  {task.Status}
                </span>
              </td>
              <td>
                <a class="link" on:click|stopPropagation href="/projects/{task.Product.ProjectId}">
                  {task.Product.Project.Name}
                </a>
              </td>
              <td>
                <span>
                  {task.DateUpdated ? getRelativeTime(task.DateUpdated) : 'null'}
                </span>
              </td>
            </tr>
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

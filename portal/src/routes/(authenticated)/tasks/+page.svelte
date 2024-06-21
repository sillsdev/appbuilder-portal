<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import { getRelativeTime } from '$lib/relativeTime';
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;
  const iconMap = {
    android: 'flat-color-icons:android-os',
    html: 'mdi:web',
    pwa: 'mdi:web',
    package: 'mdi:archive',
    none: 'mdi:error-outline'
  };
  // Not sure I like this, but it's implemented here as it was in S1.
  // I would suggest having a productDefinition db field for what type this is
  // TODO: icon colors?
  function getIcon(task: (typeof data.tasks)[0]) {
    return iconMap[
      (Object.keys(iconMap).find((key) =>
        task.Product.ProductDefinition.Name?.toLowerCase().includes(key)
      ) as keyof typeof iconMap) ?? 'none'
    ];
  }
</script>

<div class="w-full">
  <h1>{$_('tasks.title')}</h1>
  <div class="m-4 relative mt-0">
    {#if data.tasks.length > 0}
      <table class="w-full">
        <thead>
          <tr class="border-b-2 text-left">
            <th>{$_('tasks.product')}</th>
            <th>{$_('tasks.project')}</th>
            <th>{$_('tasks.waitTime')}</th>
          </tr>
        </thead>
        <tbody>
          {#each data.tasks as task}
            <tr
              class="pointer"
              on:click={() =>
                goto(
                  `/flow/${task.Product.ProductDefinition.Workflow.WorkflowBusinessFlow}/${task.ProductId}`
                )}
            >
              <td>
                <Icon class="inline" icon={getIcon(task)} width="38" />
                <span>
                  {task.Product.ProductDefinition.Name}
                </span>
                <br />
                <span class="rounded-xl bg-slate-600 p-1 px-2 text-white ml-10">
                  {task.Status}
                </span>
              </td>
              <td
                ><a href="/projects/{task.Product.ProjectId}">
                  {task.Product.Project.Name}
                </a></td
              >
              <td
                ><span>
                  {task.DateUpdated ? getRelativeTime(task.DateUpdated) : 'null'}
                </span></td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="pl-4">
        <h3 class="p-0">{$_('tasks.noTasksTitle')}</h3>
        <span>{$_('tasks.noTasksDescription')}</span>
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
  td a {
    color: #33f;
    text-decoration: underline;
  }
</style>

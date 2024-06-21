<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import { getRelativeTime } from '$lib/relativeTime';
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;
</script>

<div class="w-full">
  <h1>{$_('tasks.title')}</h1>
  <div class="m-4 relative mt-0">
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
              <Icon class="inline" icon="flat-color-icons:android-os" width="38" />
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

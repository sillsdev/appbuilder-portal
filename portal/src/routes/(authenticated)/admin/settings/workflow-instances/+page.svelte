<script lang="ts">
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="w-full">
  <h2>{m.admin_settings_workflowInstances_title()}</h2>
  <div class="m-4 relative mt-0">
    {#if data.instances.length > 0}
      <table class="w-full">
        <thead>
          <tr class="border-b-2 text-left">
            <th>{m.tasks_product()}</th>
            <th>{m.project_products_transitions_state()}</th>
            <th>{m.project_products_transitions_date()}</th>
          </tr>
        </thead>
        <tbody>
          {#each data.instances as i}
            <tr
              class="cursor-pointer"
              on:click={() => goto(`/admin/settings/workflow-instances/${i.Product.Id}`)}
            >
              <td>
                {i.Product.Id}
              </td>
              <td>
                {i.Product.ProductTransitions[0].DestinationState}
              </td>
              <td>
                {i.Product.ProductTransitions[0].DateTransition}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="m-8">{m.admin_settings_workflowInstances_empty()}</p>
    {/if}
  </div>
</div>

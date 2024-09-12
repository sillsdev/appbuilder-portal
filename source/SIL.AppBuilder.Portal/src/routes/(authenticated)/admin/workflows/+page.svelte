<script lang="ts">
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="w-full">
  <h1>{m.admin_workflowInstances_title()}</h1>
  <div class="m-4 relative mt-0">
    {#if data.instances.length > 0}
      <table class="w-full">
        <thead>
          <tr class="border-b-2 text-left">
            <th>{m.tasks_product()}</th>
            <!-- TODO: i18n -->
            <th>Last State</th>
            <th>Transition Date</th>
          </tr>
        </thead>
        <tbody>
          {#each data.instances as i}
            <tr class="cursor-pointer" on:click={() => goto(`/admin/workflows/${i.Product.Id}`)}>
              <td>
                {i.Product.Id}
              </td>
              <td>
                {i.Product.ProductTransitions[0].InitialState}
              </td>
              <td>
                {i.Product.ProductTransitions[0].DateTransition}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="pl-4">
        <!-- TODO: i18n -->
        <h3 class="p-0">There are no active workflow instances</h3>
        <span>Try creating a product</span>
      </div>
    {/if}
  </div>
</div>

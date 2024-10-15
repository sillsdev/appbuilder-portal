<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import TableWrapper from '$lib/components/TableWrapper.svelte';
  import { createRender } from 'svelte-headless-table';
  import AnchorWrapper from '$lib/components/AnchorWrapper.svelte';

  export let data: PageData;
</script>

<div class="w-full">
  <h1>{m.admin_workflowInstances_title()}</h1>
  <div class="m-4 relative mt-0">
    {#if data.instances.length > 0}
      <TableWrapper data={data.instances} initialCount={data.count} dataForm={data.form} columns={[
        {
          id: 'product',
          header: m.tasks_product(),
          accessor: (i) => i.Product.Id,
          cell: (c) => createRender(AnchorWrapper, {
            href: `/admin/workflows/${c.value}`,
            content: c.value
          })
        },
        {
          id: 'state',
          header: m.project_products_transitions_state(),
          accessor: (i) => i.Product.ProductTransitions[0].DestinationState
        },
        {
          id: 'date',
          header: m.project_products_transitions_date(),
          accessor: (i) => i.Product.ProductTransitions[0].DateTransition,
          cell: (c) => c.value?.toLocaleString() ?? '',
          searchable: false
        }
      ]}
      endpoint='page'/>
    {:else}
      <div class="pl-4">
        <!-- TODO: i18n -->
        <h3 class="p-0">There are no active workflow instances</h3>
        <span>Try creating a product</span>
      </div>
    {/if}
  </div>
</div>

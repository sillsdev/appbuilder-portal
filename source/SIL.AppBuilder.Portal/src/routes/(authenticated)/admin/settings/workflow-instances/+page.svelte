<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import SortTable from '$lib/components/SortTable.svelte';

  export let data: PageData;
</script>

<div class="w-full">
  <h2>{m.admin_settings_workflowInstances_title()}</h2>
  <div class="m-4 relative mt-0">
    {#if data.instances.length > 0}
      <SortTable
        data={data.instances}
        columns={[
          {
            id: 'product',
            header: m.tasks_product(),
            data: (i) => i.Id,
            render: (c) =>
              `<a class="link" href="/admin/settings/workflow-instances/${c}">${c}</a>`,
            sortable: true
          },
          {
            id: 'state',
            header: m.project_products_transitions_state(),
            data: (i) => i.Transition.State,
            sortable: true
          },
          {
            id: 'date',
            header: m.project_products_transitions_date(),
            data: (i) => i.Transition.Date,
            render: (c) => c?.toLocaleString() ?? '',
            sortable: true
          }
        ]}
        serverSide={true}
        maxh_class="max-h-full"
      />
    {:else}
      <p class="m-8">{m.admin_settings_workflowInstances_empty()}</p>
    {/if}
  </div>
</div>

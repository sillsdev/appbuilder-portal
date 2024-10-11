<script lang="ts">
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  import { writable } from 'svelte/store';
  import type { PageData } from './$types';
  import { createTable, Subscribe, Render } from 'svelte-headless-table';
  import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
  import SortDirectionPicker from '$lib/components/SortDirectionPicker.svelte';

  export let data: PageData;

  const tableData = writable(data.instances);

  const table = createTable(tableData, {
    sort: addSortBy(),
    page: addPagination({
      initialPageSize: 2
    })
  });

  const columns = table.createColumns([
    table.column({
      id: 'product',
      header: m.tasks_product(),
      accessor: (i) => i.Product.Id
    }),
    table.column({
      id: 'state',
      header: m.project_products_transitions_state(),
      accessor: (i) => i.Product.ProductTransitions[0].DestinationState
    }),
    table.column({
      id: 'date',
      header: m.project_products_transitions_date(),
      accessor: (i) => i.Product.ProductTransitions[0].DateTransition,
      cell: (c) => c.value?.toLocaleString()!
    })
  ]);

  const {
    headerRows,
    pageRows: rows,
    tableAttrs,
    tableBodyAttrs,
    pluginStates
  } = table.createViewModel(columns);

  const {
    pageIndex,
    hasPreviousPage,
    hasNextPage,
    pageCount
  } = pluginStates.page;

  const {
    sortKeys
  } = pluginStates.sort;

  $: console.log($sortKeys);
</script>

<div class="w-full">
  <h1>{m.admin_workflowInstances_title()}</h1>
  <div class="m-4 relative mt-0">
    {#if data.instances.length > 0}
      <form>
        <div class="join">
          {#each Array.from({ length: $pageCount}) as _, i}
          <label class="join-item btn btn-square form-control">
            <span>{i+1}</span>
            <input class="hidden" type="radio" name="page" value={i+1}>
          </label>
          {/each}
        </div>
      </form>
      <table class="w-full" {...$tableAttrs}>
        <thead>
          {#each $headerRows as headerRow (headerRow.id)}
            <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
              <tr class="border-b-2 text-left" {...rowAttrs}>
                {#each headerRow.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                    <th {...attrs} on:click={props.sort.toggle}>
                      <SortDirectionPicker order={props.sort.order}>
                        <Render of={cell.render()} />
                      </SortDirectionPicker>
                    </th>
                  </Subscribe>
                {/each}
              </tr>
            </Subscribe>
          {/each}
        </thead>
        <tbody {...$tableBodyAttrs}>
          {#each $rows as row (row.id)}
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
              <tr
                {...rowAttrs}
                on:click={() => {
                  if (row.isData()) goto(`/admin/workflows/${row.original.Product.Id}`);
                }}
              >
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <td {...attrs}>
                      <Render of={cell.render()} />
                    </td>
                  </Subscribe>
                {/each}
              </tr>
            </Subscribe>
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

<style lang="postcss">
  tr {
    @apply cursor-pointer select-none;
  }
  tbody > tr:hover {
    @apply bg-info;
  } /* this helps prevent the vertical jankiness */
  thead {
    line-height: inherit;
  }
</style>

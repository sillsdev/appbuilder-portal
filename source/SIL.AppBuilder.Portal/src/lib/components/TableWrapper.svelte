<script lang="ts">
  import { writable } from 'svelte/store';
  import { createTable, Subscribe, Render } from 'svelte-headless-table';
  import type { DataColumnInitBase, DataColumnInitFnAndId } from 'svelte-headless-table';
  import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
  import { superForm } from 'sveltekit-superforms';
  import type { SuperValidated, Infer, FormResult } from 'sveltekit-superforms';
  import { onDestroy } from 'svelte';
  import SearchIcon from '$lib/icons/SearchIcon.svelte';
  import type { TableSchema } from '$lib/table';
  import ArrowDownIcon from '$lib/icons/ArrowDownIcon.svelte';
  import ArrowUpIcon from '$lib/icons/ArrowUpIcon.svelte';
  import Pagination from './forms/Pagination.svelte';

  export let data: any[];
  export let initialCount: number;
  export let dataForm: SuperValidated<Infer<TableSchema>>;

  const tableData = writable(data);
  const count = writable(initialCount);

  // For some reason this gives a duplicate form id warning when there is more than one of these in a page
  // given that each one *should* be posting to a separate endpoint, it should be fine?
  const { form, enhance, submit } = superForm(dataForm, {
    dataType: 'json',
    resetForm: false,
    onChange(event) {
      if (!(event.paths.includes('page.size') || event.paths.includes('search.text'))) {
        submit();
      }
    },
    onUpdate(event) {
      const data = event.result.data as FormResult<{ query: { data: any[]; count: number } }>;
      if (event.form.valid && data.query) {
        tableData.set(data.query.data);
        count.set(data.query.count);
      }
    }
  });

  const table = createTable(tableData, {
    sort: addSortBy({
      serverSide: true
    }),
    page: addPagination({
      serverSide: true,
      serverItemCount: count
    })
  });

  type Item = (typeof data)[0];
  type Value = any;
  type Extra = { searchable?: boolean };

  export let columns: (DataColumnInitBase<Item, typeof table.plugins, Value> &
    DataColumnInitFnAndId<Item, string, Value> &
    Extra)[];
  export let endpoint: string;

  const {
    headerRows,
    pageRows: rows,
    tableAttrs,
    tableBodyAttrs,
    pluginStates
  } = table.createViewModel(table.createColumns(columns.map((c) => table.column(c))));

  const { pageIndex, pageSize } = pluginStates.page;

  const { sortKeys } = pluginStates.sort;

  $: pageSize.set($form.page.size);
  $: pageIndex.set($form.page.page);

  const sortUnsub = sortKeys.subscribe((keys) => {
    form.update((data) => ({
      ...data,
      sort: keys.map((k) => ({ field: k.id, direction: k.order }))
    }));
  });

  onDestroy(() => {
    sortUnsub();
  });
</script>

{#if data.length > 0}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <form
    method="POST"
    action="?/{endpoint}"
    use:enhance
    class="flex flex-row gap-2 flex-wrap"
    on:keydown={(event) => {
      if (event.key === 'Enter') submit();
    }}
  >
    <!-- TODO: Use full-text search in Prisma once it's stable? -->
    <!-- TODO: Add Date specific search? -->
    <select bind:value={$form.search.field} class="select select-bordered w-full max-w-xs">
      <option value={null} selected>Anywhere</option>
      {#each columns as col}
        {#if col.searchable !== false}
          <option value={col.id}>{col.header}</option>
        {/if}
      {/each}
    </select>
    <span class="input input-bordered flex items-center gap-2 max-w-xs">
      <input type="text" name="search.text" bind:value={$form.search.text} />
      <SearchIcon />
    </span>
    <Pagination bind:size={$form.page.size} total={$count} bind:page={$form.page.page} />
  </form>
  <table class="w-full" {...$tableAttrs}>
    <thead>
      {#each $headerRows as headerRow (headerRow.id)}
        <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
          <tr class="border-b-2 text-left" {...rowAttrs}>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                <th
                  {...attrs}
                  on:click={props.sort.toggle}
                >
                  <div>
                    <Render of={cell.render()} />
                  </div>
                  <div>
                    {#if props.sort.order === 'asc'}
                      <ArrowUpIcon />
                    {:else if props.sort.order === 'desc'}
                      <ArrowDownIcon />
                    {:else}
                      &nbsp;
                    {/if}
                  </div>
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
          <tr {...rowAttrs}>
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
{/if}

<style lang="postcss">
  tr {
    @apply cursor-pointer select-none;
  }
  tbody > tr:hover {
    @apply bg-info;
  }
  thead {
    /* this helps prevent the vertical jankiness */
    line-height: inherit;
  }
  th > div {
    display: inline-block;
    /* these help mitigate some of the visual jankiness */
    min-width: 24px;
    min-height: 26px;
  }
</style>

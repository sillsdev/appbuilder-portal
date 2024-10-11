<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { writable } from 'svelte/store';
  import type { PageData, ActionData } from './$types';
  import { createTable, Subscribe, Render } from 'svelte-headless-table';
  import { addSortBy, addPagination } from 'svelte-headless-table/plugins';
  import SortDirectionPicker from '$lib/components/SortDirectionPicker.svelte';
  import { superForm, type FormResult } from 'sveltekit-superforms';

  export let data: PageData;

  const tableData = writable(data.transitions);
  const count = writable(data.count);

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onChange(event) {
      //console.log(event);
      if (event.paths.includes('page')) {
        submit();
      }
    },
    onUpdate(event) {
      //console.log(event);
      const data = event.result.data as FormResult<ActionData>;
      if (event.form.valid && data.query) {
        tableData.set(data.query.data);
        count.set(data.query.count);
      }
    }
  });

  const table = createTable(tableData, {
    sort: addSortBy(),
    page: addPagination({
      serverSide: true,
      serverItemCount: count
    })
  });

  const columns = table.createColumns([
    table.column({
      id: 'InitialState',
      header: 'State',
      accessor: (t) => t.InitialState
    }),
    table.column({
      id: 'AllowedUserNames',
      header: 'User',
      accessor: (t) => t.AllowedUserNames ?? 'Scriptoria'
    }),
    table.column({
      id: 'Command',
      header: 'Command',
      accessor: (t) => t.Command ?? ''
    }),
    table.column({
      id: 'Date',
      header: 'Date',
      accessor: (t) => t.DateTransition,
      cell: (c) => c.value?.toLocaleString() ?? ''
    })
  ]);

  const {
    headerRows,
    pageRows: rows,
    tableAttrs,
    tableBodyAttrs,
    pluginStates
  } = table.createViewModel(columns);

  const { pageIndex, pageCount, pageSize, hasNextPage, hasPreviousPage } = pluginStates.page;

  const { sortKeys } = pluginStates.sort;

  $: pageSize.set($form.size);
  $: pageIndex.set($form.page);
  $: collapse = $pageCount > 6;
  //$: console.log($sortKeys);

  function index(i: number, page: number): number {
    if (page <= 3) return i + 2;
    else if (page > $pageCount - 5) return $pageCount + i - 5;
    else return page + i - 1;
  }
</script>

<div class="w-full">
  <h1>{m.admin_workflowInstances_title()}</h1>
  <div class="m-4 relative mt-0">
    {#if data.transitions.length > 0}
      <form method="POST" action="?/page" use:enhance>
        <input class="input input-bordered" type="number" name="size" bind:value={$form.size} />
        {#if $pageCount > 1}
          <div class="join">
            <label
              class="join-item btn btn-square form-control {$hasPreviousPage ? '' : 'btn-disabled'}"
            >
              <span>«</span>
              <input
                class="hidden"
                type="radio"
                bind:group={$form.page}
                name="page"
                value={$form.page - 1}
              />
            </label>
            <label
              class="join-item btn btn-square form-control {$form.page === 0 ? 'bg-primary' : ''}"
            >
              <span>{1}</span>
              <input class="hidden" type="radio" bind:group={$form.page} name="page" value={0} />
            </label>
            {#if collapse}
              {#if $form.page > 3}
                <button class="join-item btn btn-disabled">...</button>
              {:else}
                <label
                  class="join-item btn btn-square form-control {$form.page === 1
                    ? 'bg-primary'
                    : ''}"
                >
                  <span>{2}</span>
                  <input
                    class="hidden"
                    type="radio"
                    bind:group={$form.page}
                    name="page"
                    value={1}
                  />
                </label>
              {/if}
              {#each Array.from({ length: 3 }) as _, i}
                <label
                  class="join-item btn btn-square form-control {$form.page === index(i, $form.page)
                    ? 'bg-primary'
                    : ''}"
                >
                  <span>{index(i, $form.page) + 1}</span>
                  <input
                    class="hidden"
                    type="radio"
                    bind:group={$form.page}
                    name="page"
                    value={index(i, $form.page)}
                  />
                </label>
              {/each}
              {#if $form.page < $pageCount - 4}
                <button class="join-item btn btn-disabled">...</button>
              {:else}
                <label
                  class="join-item btn btn-square form-control {$form.page === $pageCount - 2
                    ? 'bg-primary'
                    : ''}"
                >
                  <span>{$pageCount - 1}</span>
                  <input
                    class="hidden"
                    type="radio"
                    bind:group={$form.page}
                    name="page"
                    value={$pageCount - 2}
                  />
                </label>
              {/if}
            {:else}
              {#each Array.from({ length: $pageCount - 2 }) as _, i}
                <label
                  class="join-item btn btn-square form-control {$form.page === i + 1
                    ? 'bg-primary'
                    : ''}"
                >
                  <span>{i + 2}</span>
                  <input
                    class="hidden"
                    type="radio"
                    bind:group={$form.page}
                    name="page"
                    value={i + 1}
                  />
                </label>
              {/each}
            {/if}
            <label
              class="join-item btn btn-square form-control {$form.page === $pageCount - 1
                ? 'bg-primary'
                : ''}"
            >
              <span>{$pageCount}</span>
              <input
                class="hidden"
                type="radio"
                bind:group={$form.page}
                name="page"
                value={$pageCount - 1}
              />
            </label>
            <label
              class="join-item btn btn-square form-control {$hasNextPage ? '' : 'btn-disabled'}"
            >
              <span>»</span>
              <input
                class="hidden"
                type="radio"
                bind:group={$form.page}
                name="page"
                value={$form.page + 1}
              />
            </label>
          </div>
        {/if}
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

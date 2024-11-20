<!--
  A table that can be sorted by column.
  @component
-->
<script lang="ts">
  import { languageTag } from '$lib/paraglide/runtime';
  import { ArrowDownIcon, ArrowUpIcon } from '$lib/icons';
  import { createEventDispatcher } from 'svelte';
  export let data: { [key: string]: any }[];
  /** Definition of the columns for the table */
  export let columns: {
    /** Internal id, used for determining which column is being sorted */
    id: string;
    /** User-facing string for column headers */
    header: string;
    /** Accessor method to get the desired data */
    data: (i: any) => any;
    /** Renders the data to an HTML string */
    render?: (d: any) => string;
    /** Will not sort a field if this is false or undefined */
    sortable?: boolean;
  }[];
  export let className: string = '';
  /** If this is true, will defer sorting to the server instead */
  export let serverSide: boolean = false;

  /** Current field being sorted. Defaults to first field where `sortable === true` */
  let current = columns.find((c) => c.sortable)!;
  let descending = false;

  function sortColByDirection(key: (typeof columns)[0]) {
    if (current.id !== key.id) {
      // change current field
      descending = false;
      current = key;
    } else {
      if (descending) {
        // reset to sort default field
        if (current !== columns.find((c) => c.sortable)!) {
          sortColByDirection(columns.find((c) => c.sortable)!);
          return; //don't sort twice
        } else {
          descending = false;
        }
      } else {
        descending = true;
      }
    }
    if (serverSide) {
      sendSortEvent('sort', { field: current.id, direction: descending ? 'desc' : 'asc' });
    } else {
      // sort based on current field
      // if blank, sort first field
      const cell = current.data || columns.find((c) => c.sortable)!.data;
      const langTag = languageTag();
      data =
        typeof cell(data[0]) === 'string'
          ? // sort strings
            data.sort((a, b) => {
              return descending
                ? cell(b).localeCompare(cell(a), langTag)
                : cell(a).localeCompare(cell(b), langTag);
            })
          : // sort non-strings (i.e. numbers)
            data.sort((a, b) => {
              if (cell(a) === cell(b)) {
                return 0;
              } else if (cell(a) > cell(b)) {
                return descending ? -1 : 1;
              } else {
                return descending ? 1 : -1;
              }
            });
    }
  }

  const sendSortEvent = createEventDispatcher<{
    sort: {
      field: string;
      direction: 'asc' | 'desc';
    };
  }>();
</script>

<div class="overflow-y {className}">
  <table class="table">
    <thead>
      <tr>
        {#each columns as c}
          <th
            on:click={() => {
              if (c.sortable) {
                sortColByDirection(c);
              }
            }}
          >
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="form-control flex-row">
              <span class="label-text">{c.header}</span>
              <span class="direction-arrow">
                {#if current.id === c.id && c.sortable}
                  {#if descending}
                    <ArrowDownIcon />
                  {:else}
                    <ArrowUpIcon />
                  {/if}
                {:else}
                  &nbsp;
                {/if}
              </span>
            </label>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as d}
        <tr>
          {#each columns as c}
            <td>
              {#if c.render}
                {@html c.render(c.data(d))}
              {:else}
                {c.data(d)}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="postcss">
  tr {
    @apply cursor-pointer select-none;
  }
  tbody > tr:hover {
    @apply bg-neutral;
  }
  thead {
    /* this helps prevent the vertical jankiness */
    line-height: inherit;
    position: sticky;
    top: 0;
    @apply bg-base-100;
  }
  .direction-arrow {
    display: inline-block;
    /* reserve space for the arrow, so headers don't expand when arrow is visible */
    min-width: 24px;
    min-height: 26px;
  }
  label {
    @apply select-none cursor-pointer;
  }
</style>

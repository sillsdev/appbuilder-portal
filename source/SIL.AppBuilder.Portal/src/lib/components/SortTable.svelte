<script lang="ts">
  import { languageTag } from '$lib/paraglide/runtime';
  import { ArrowDownIcon, ArrowUpIcon } from '$lib/icons';
  import { createEventDispatcher } from 'svelte';
  export let data: { [key: string]: any }[];
  export let columns: {
    id: string;
    header: string;
    data: (i: any) => any;
    render?: (d: any) => string;
    sortable?: boolean;
  }[];
  export let className: string = '';
  export let maxh_class: string = 'max-h-96';
  export let serverSide: boolean = false;

  let current = columns.find((c) => c.sortable)!; //current field being sorted
  let descending = false;

  const handleClick = (key: (typeof columns)[0]) => {
    if (current.id !== key.id) {
      // change current field
      descending = false;
      current = key;
    } else {
      if (descending) {
        // reset to sort default field
        if (current !== columns.find((c) => c.sortable)!) {
          handleClick(columns.find((c) => c.sortable)!);
          return; //don't sort twice
        } else {
          descending = false;
        }
      } else {
        descending = true;
      }
    }
    if (serverSide) {
      dispatch('sort', { field: current.id, direction: descending ? 'desc' : 'asc' });
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
  };

  const dispatch = createEventDispatcher<{
    sort: {
      field: string;
      direction: 'asc' | 'desc';
    };
  }>();
</script>

<div class="overflow-y {maxh_class}">
  <table class="table">
    <thead>
      <tr>
        {#each columns as c}
          <th
            on:click={() => {
              if (c.sortable) {
                handleClick(c);
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
    <tbody class={className}>
      {#each data as d}
        <tr>
          {#each columns as c}
            <td>{@html c.render ? c.render(c.data(d)) : c.data(d)}</td>
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
    /* these help mitigate some of the visual jankiness */
    min-width: 24px;
    min-height: 26px;
  }
  label {
    @apply select-none cursor-pointer;
  }
</style>

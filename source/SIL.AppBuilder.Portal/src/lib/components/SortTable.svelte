<!--
  A table that can be sorted by column.
  @component
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import { ArrowDownIcon, ArrowUpIcon } from '$lib/icons';
  
  interface Props {
    data: T[];
    /** Definition of the columns for the table */
    columns: {
      /** Internal id, used for determining which column is being sorted. Also dispatched to `onSort` */
      id: string;
      /** User-facing string for column headers */
      header: string;
      /** comparison function. Will not sort a field if this is undefined, even if `serverSide` is `true`.
       * 
       * If `serverSide` is `true`, just use a dummy function like `() => 0`
       */
      compare?: (a: T, b: T) => number;
    }[];
    class?: string;
    /** If this is true, will defer sorting to the server instead */
    serverSide?: boolean;
    onSort?: (field: string, direction: 'asc' | 'desc') => void;
    row: import('svelte').Snippet<[T]>;
  }

  let {
    data = $bindable(),
    columns,
    class: className = '',
    serverSide = false,
    onSort,
    row
  }: Props = $props();

  let firstSortable = $derived(columns.find((c) => c.compare !== undefined)!)

  /** Current field being sorted. Defaults to first field that can be sorted */
  let current = $state(columns.find((c) => c.compare !== undefined)!);
  let descending = $state(false);

  function sortColByDirection(key: (typeof columns)[0]) {
    if (current.id !== key.id) {
      // change current field
      descending = false;
      current = key;
    } else {
      if (descending) {
        // reset to sort default field
        if (current.id !== firstSortable.id) {
          sortColByDirection(firstSortable);
          return; //don't sort twice
        } else {
          descending = false;
        }
      } else {
        descending = true;
      }
    }
    if (serverSide) {
      onSort?.(current.id, descending ? 'desc' : 'asc');
    } else {
      // sort based on current field
      // if blank, sort first field
      const compare = current.compare || firstSortable.compare;
      data = data.sort((a, b) => {
        return descending ? (compare?.(b, a) ?? 0) : (compare?.(a, b) ?? 0);
      });
    }
  }
</script>

<div class="overflow-y {className}">
  <table class="table">
    <thead>
      <tr>
        {#each columns as c}
          <th
            onclick={() => {
              if (c.compare) {
                sortColByDirection(c);
              }
            }}
          >
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="form-control flex-row">
              <span class="label-text">{c.header}</span>
              <span class="direction-arrow">
                {#if current.id === c.id && c.compare}
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
        {@render row(d)}
      {/each}
    </tbody>
  </table>
</div>

<style lang="postcss">
  tr {
    @apply cursor-pointer select-none;
  }
  thead {
    /* this helps prevent the vertical jankiness */
    line-height: inherit;
    position: sticky;
    top: 0;
    @apply bg-neutral;
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
  th {
    @apply border;
  }
</style>

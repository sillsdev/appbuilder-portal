<script lang="ts">
  import { languageTag } from '$lib/paraglide/runtime';
  import { ArrowDownIcon, ArrowUpIcon } from '$lib/icons';
  export let items: { [key: string]: any }[];

  let current = ''; //current field being sorted
  let descending = false;

  const handleClick = (key: string) => {
    if (current !== key) {
      // change current field
      descending = false;
      current = key;
    } else {
      if (descending) {
        // reset to sort default field
        handleClick('');
        return; //don't sort twice
      } else {
        descending = true;
      }
    }
    // sort based on current field
    // if blank, sort first field
    const field = current || Object.keys(items[0])[0];
    const langTag = languageTag();
    items =
      typeof items[0][field] === 'string'
        ? // sort strings
          items.sort((a, b) => {
            return descending
              ? b[field].localeCompare(a[field], langTag)
              : a[field].localeCompare(b[field], langTag);
          })
        : // sort non-strings (i.e. numbers)
          items.sort((a, b) => {
            return descending ? b[field] - a[field] : a[field] - b[field];
          });
  };
</script>

<table class="table">
  <thead>
    <tr>
      {#each Object.keys(items[0]) as key}
        <th on:click={() => handleClick(key)}>
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="form-control flex-row">
            <span class="label-text">{key}</span>
            <span class="direction-arrow">
              {#if current === key}
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
    {#each items as item}
      <tr>
        {#each Object.values(item) as val}
          <td>{val}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

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

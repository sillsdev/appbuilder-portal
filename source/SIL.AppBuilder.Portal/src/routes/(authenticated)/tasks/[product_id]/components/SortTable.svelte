<script lang="ts">
  import SortDirectionPicker from "./SortDirectionPicker.svelte";
  export let items: {[key: string]: any}[];

  let current = ""; //current field being sorted
  let descending = false;

  const handleClick = (key: string) => {
    if (current !== key) {
      // change current field
      descending = false;
      current = key;
    }
    else {
      if (descending) {
        // reset to sort default field
        handleClick("");
        return; //don't sort twice
      }
      else {
        descending = true;
      }
    }
    // sort based on current field
    // if blank, sort first field
    const field = current || Object.keys(items[0])[0];
    items = (typeof items[0][field] === 'string')?
      // sort strings
      items.sort((a, b) => {
        return descending ?
          b[field].localeCompare(a[field]):
          a[field].localeCompare(b[field]);
      }):
      // sort non-strings (i.e. numbers)
      items.sort((a, b) => {
        return descending?
          b[field] - a[field]:
          a[field] - b[field];
      });
  }
</script>

<table class="table">
  <thead>
    <tr>
      {#each Object.keys(items[0]) as key}
      <th on:click={() => handleClick(key)}>
        <SortDirectionPicker active={current === key} bind:descending={descending}>
          {key}
        </SortDirectionPicker>
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
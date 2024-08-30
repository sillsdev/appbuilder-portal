<script lang="ts">
  import SortDirectionPicker from "./SortDirectionPicker.svelte";
  export let items: {[key: string]: any}[];

  let current = "";
  let desc: {[key: string]: boolean} = {};
  $: console.log(desc);
  $: console.log(current);

  const handleClick = (key: string) => {
    if (current !== key) {
      desc[current] = false;
      desc[key] = false;
      current = key;
    }
    else {
      if (desc[current]) {
        handleClick("");
        return; //don't sort twice
      }
      else {
        desc[current] = true;
      }
    }
    const sKey = current || Object.keys(items[0])[0];
    items = (typeof items[0][sKey] === 'string')?
      items.sort((a, b) => {
        return desc[sKey] ?
          b[sKey].localeCompare(a[sKey]):
          a[sKey].localeCompare(b[sKey]);
      }):
      items.sort((a, b) => {
        return desc[sKey]?
          b[sKey] - a[sKey]:
          a[sKey] - b[sKey];
      });
  }
</script>

<table class="table">
  <!-- head -->
  <thead>
    <tr>
      {#each Object.keys(items[0]) as key}
      <th on:click|capture|stopPropagation={() => handleClick(key)}>
        <SortDirectionPicker current={current === key} bind:desc={desc[key]}>
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
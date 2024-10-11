<script lang="ts">
  export let order: 'asc' | 'desc' | undefined;
  import ArrowDownIcon from '$lib/icons/ArrowDownIcon.svelte';
  import ArrowUpIcon from '$lib/icons/ArrowUpIcon.svelte';
</script>

<div>
  <slot></slot>
</div>
<div>
  {#if order === 'asc'}
    <ArrowUpIcon />
  {:else if order === 'desc'}
    <ArrowDownIcon />
  {:else}
    &nbsp;
  {/if}
</div>

<style>
  div {
    display: inline-block;
    /* these help mitigate some of the visual jankiness */
    min-width: 24px;
    min-height: 26px;
  }
</style>
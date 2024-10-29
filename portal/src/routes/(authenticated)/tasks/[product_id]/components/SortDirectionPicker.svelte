<script lang="ts">
  import { ArrowDownIcon, ArrowUpIcon } from "$lib/icons";

  export let active: boolean;
  export let descending: boolean;

  // TODO: selecting one of these causes the relative sizes of the table headers to change, which looks really janky. I've tried fixing this, but have been unsuccessful. For now, at least it functions correctly, even if it doesn't look quite right.
</script>

<div class="form-control">
  <label>
    <span class="{active? "":"hidden"}">
      {#if descending}
      <ArrowDownIcon />
      {:else}
      <ArrowUpIcon />
      {/if}
    </span>
    <span class="label-text"><slot></slot></span>
  </label>
</div>

<style lang=postcss>
  label {
    @apply select-none cursor-pointer;
  }
</style>
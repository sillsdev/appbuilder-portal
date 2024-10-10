<script lang="ts">
  import { ArrowDownIcon, ArrowUpIcon } from '$lib/icons';

  export let active: boolean;
  export let descending: boolean;
</script>

<div class="form-control">
  <label>
    <span class="label-text {active ? 'active' : ''}"><slot /></span>
    <div class="arrow">
      {#if active}
        {#if descending}
          <ArrowDownIcon />
        {:else}
          <ArrowUpIcon />
        {/if}
      {:else}
        &nbsp;
      {/if}
    </div>
  </label>
</div>

<style lang="postcss">
  label {
    @apply select-none cursor-pointer;
    min-height: 24px;
  }
  .label-text {
    display: inline-block;
    position: relative;
    bottom: 0;
    height: 100%;
  }
  .arrow {
    display: inline-block;
    width: 24px;
  }
  .active {
    @apply text-neutral-content text-opacity-75;
  }
</style>

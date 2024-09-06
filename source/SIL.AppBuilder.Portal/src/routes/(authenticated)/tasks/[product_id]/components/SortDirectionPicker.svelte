<script lang="ts">
  import { DownArrow, UpArrow } from "$lib/icons";

  export let current: boolean;
  export let desc: boolean;
</script>

<div class="form-control">
  <label>
    <span class="{current? "":"hidden"}">
      {#if desc}
      <!-- down arrow -->
      <DownArrow />
      {:else}
      <!-- up arrow -->
      <UpArrow />
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
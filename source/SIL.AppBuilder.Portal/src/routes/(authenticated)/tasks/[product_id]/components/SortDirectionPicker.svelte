<script lang="ts">
  export let current: boolean;
  export let desc: boolean;
</script>

<div class="form-control">
  <label>
    <span class="{current? "":"hidden"}">
      {#if desc}
      <!-- down arrow -->
      <svg 
        class="inline fill-current"
        xmlns="http://www.w3.org/2000/svg" 
        height="24px" 
        viewBox="0 -960 960 960" 
        width="24px">
        <path d="M480-360 280-560h400L480-360Z"/>
      </svg>
      {:else}
      <!-- up arrow -->
      <svg 
        class="inline fill-current"
        xmlns="http://www.w3.org/2000/svg" 
        height="24px" 
        viewBox="0 -960 960 960" 
        width="24px">
        <path d="m280-400 200-200 200 200H280Z"/>
      </svg>
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
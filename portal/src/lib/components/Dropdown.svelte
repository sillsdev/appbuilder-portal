<!--
@component
A simple dropdown menu from DaisyUI.
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let cols = 6;
  const dispatch = createEventDispatcher();
</script>

<div class="dropdown">
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <label tabindex="0" class="btn btn-ghost p-0.5 no-animation flex-nowrap">
    <slot name="label" />
  </label>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    tabindex="0"
    class="dropdown-content menu drop-shadow-lg mt-2.5 bg-base-100 z-10"
    class:min-w-[21rem]={cols == 6}
    class:min-w-[17.25rem]={cols == 5}
    on:blur={() => dispatch('nav-end')}
  >
    <slot name="content" />
  </div>
</div>

<script lang="ts">
  import * as m from '../paraglide/messages';
  import IconContainer from './IconContainer.svelte';

  export let className: string = '';
  export let value: string;
  export let tooltip: string = '';
</script>

<div
  class="{className} {tooltip ? 'tooltip tooltip-bottom' : ''}"
  data-html="true"
  data-tip={tooltip}
>
  <label class="input input-bordered flex items-center gap-2 w-full">
    <input type="text" placeholder={m.search()} class="flex-grow" bind:value />
    <IconContainer icon="mdi:search" class="ml-auto" width={24} />
  </label>
</div>

<style>
  .tooltip:before {
    white-space: pre-wrap;
    text-align: start;
  }
</style>

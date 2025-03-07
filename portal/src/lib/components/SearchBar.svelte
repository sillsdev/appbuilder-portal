<script lang="ts">
  import * as m from '../paraglide/messages';
  import IconContainer from './IconContainer.svelte';

  interface Props {
    className?: string;
    value: string;
    /** TODO: replace with component. will need to wait until Svelte 5/DaisyUI 5*/
    tooltip?: string;
  }

  let { className = '', value = $bindable(), tooltip = '' }: Props = $props();
</script>

<div
  class="{tooltip ? 'tooltip tooltip-bottom' : ''} {className}"
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

<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import IconContainer from './IconContainer.svelte';

  interface Props {
    className?: string;
    value: string;
  }

  let { className = '', value = $bindable() }: Props = $props();
</script>

<div
  class={className}
  data-html="true"
>
  <label class="input input-bordered flex items-center gap-2 w-full">
    <input type="text" placeholder={m.search()} class="grow" bind:value />
    <IconContainer icon="mdi:search" class="ml-auto" width={24} />
  </label>
</div>

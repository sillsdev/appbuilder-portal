<script lang="ts">
  import IconContainer from './IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    className?: string;
    value: string;
    requestSubmit?: () => void;
    requestDelay?: number;
  }

  let {
    className = '',
    value = $bindable(),
    requestSubmit,
    requestDelay = 1_000
  }: Props = $props();

  let timeout: ReturnType<typeof setTimeout> | null = $state(null);
</script>

<div class={className} data-html="true">
  <label class="input input-bordered flex items-center gap-2 w-full">
    <input
      type="search"
      placeholder={m.common_search()}
      aria-label={m.common_search()}
      class="grow"
      bind:value
      oninput={(e) => {
        if (requestSubmit) {
          if (timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(requestSubmit, requestDelay);
        }
      }}
    />
    <IconContainer icon="mdi:search" class="ml-auto cursor-pointer" width={24} />
  </label>
</div>

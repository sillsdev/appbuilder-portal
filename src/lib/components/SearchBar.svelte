<script module lang="ts">
  /** Make sure to call this in SuperForms onUpdate**d**() */
  export function focusSearchBar() {
    (document.querySelector('input[type="search"]') as HTMLInputElement)?.focus?.();
  }
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import IconContainer from './IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    class?: ClassValue;
    value: string;
    requestSubmit?: () => void;
    requestDelay?: number;
  }

  let {
    class: classes,
    value = $bindable(),
    requestSubmit,
    requestDelay = 1_000
  }: Props = $props();

  let timeout: ReturnType<typeof setTimeout> | null = $state(null);

  onDestroy(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
</script>

<div class={[classes]} data-html="true">
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
      onfocus={(e) => {
        const target = e.currentTarget;
        // https://stackoverflow.com/a/10576409
        setTimeout(() => target.setSelectionRange(value.length, value.length), 0);
      }}
    />
    <IconContainer icon="mdi:search" class="ml-auto cursor-pointer" width={24} />
  </label>
</div>

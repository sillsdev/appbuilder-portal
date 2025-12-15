<!--
@component
A simple dropdown menu from DaisyUI.

-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import { onNavigate } from '$app/navigation';
  interface Props {
    class?: {
      /** class="dropdown ..." */
      dropdown?: ClassValue;
      /** class="btn btn-ghost ..." */
      label?: ClassValue;
      /** class="dropdown-content z-10 drop-shadow-lg rounded-md bg-base-200 ..." */
      content?: ClassValue;
    };
    label: Snippet;
    content: Snippet;
    onclick?: () => void;
    open?: boolean;
  }

  let { class: classes, label, content, onclick, open = $bindable(false) }: Props = $props();

  onNavigate(() => {
    // close opened dropdown when navigating (this is mostly important for the dropdowns in the navbar)
    open = false;
  });

  let dropEl: HTMLDetailsElement | undefined = $state(undefined);
</script>

<svelte:window
  onclick={(e) => {
    // Only close if click is outside this dropdown
    if (open && dropEl && !dropEl.contains(e.target as Node)) {
      open = false;
      // stopPropagation prevents the click from registering on the dropdown again and reopening it
      e.stopPropagation();
    }
  }}
/>

<details class={['dropdown', classes?.dropdown]} bind:open bind:this={dropEl}>
  <summary class={['btn btn-ghost', classes?.label]} onclick={() => onclick?.()}>
    {@render label()}
  </summary>
  <div class={['dropdown-content z-10 drop-shadow-lg rounded-md bg-base-200', classes?.content]}>
    {@render content()}
  </div>
</details>

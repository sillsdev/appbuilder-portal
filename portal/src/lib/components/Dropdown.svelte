<!--
@component
A simple dropdown menu from DaisyUI.

-->
<script lang="ts">
  import { onNavigate } from '$app/navigation';
  import type { Snippet } from 'svelte';
  interface Props {
    /** class="dropdown ..." */
    dropdownClasses?: string;
    /** class="btn btn-ghost ..." */
    labelClasses?: string;
    /** class="dropdown-content z-10 drop-shadow-lg rounded-md bg-base-200 ..." */
    contentClasses?: string;
    label: Snippet;
    content: Snippet;
    onclick?: () => void;
    open?: boolean;
  }

  let {
    dropdownClasses = '',
    labelClasses = '',
    contentClasses = '',
    label,
    content,
    onclick,
    open = $bindable(false)
  }: Props = $props();

  onNavigate(() => {
    // close opened dropdown when navigating (this is mostly important for the dropdowns in the navbar)
    open = false;
  });
</script>

<svelte:window
  onclick={(e) => {
    // Only close if click is outside this dropdown
    const dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(e.target as Node)) {
      open = false;
      // stopPropagation prevents the click from registering on the dropdown again and reopening it
      e.stopPropagation();
    }
  }}
/>

<details class="dropdown {dropdownClasses}" bind:open>
  <summary class="btn btn-ghost {labelClasses}" onclick={() => onclick?.()}>
    {@render label()}
  </summary>
  <div class="dropdown-content z-10 drop-shadow-lg rounded-md bg-base-200 {contentClasses}">
    {@render content()}
  </div>
</details>

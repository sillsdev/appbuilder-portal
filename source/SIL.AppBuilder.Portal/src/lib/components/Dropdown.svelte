<!--
@component
A simple dropdown menu from DaisyUI.

-->
<script lang="ts">
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
</script>

<svelte:window onclick={() => (open = false)} />

<details class="dropdown {dropdownClasses}" bind:open>
  <summary class="btn btn-ghost {labelClasses}" onclick={() => onclick?.()}>
    {@render label()}
  </summary>
  <div class="dropdown-content z-10 drop-shadow-lg rounded-md bg-base-200 {contentClasses}">
    {@render content()}
  </div>
</details>

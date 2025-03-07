<!--
@component
A simple dropdown menu from DaisyUI.
-->
<!-- TODO: this component isn't used anywhere... -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    cols?: number;
    label?: Snippet;
    content?: Snippet;
    onNavEnd?: () => void;
  }

  let { cols = 6, label, content, onNavEnd }: Props = $props();
</script>

<div class="dropdown">
  <!-- When .dropdown is focused, .dropdown-content is revealed making this actually interactive -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <label tabindex="0" class="btn btn-ghost p-0.5 no-animation flex-nowrap">
    {@render label?.()}
    <div
      role="button"
      tabindex="0"
      class="dropdown-content menu drop-shadow-lg mt-2.5 bg-base-100 z-10"
      class:min-w-[21rem]={cols == 6}
      class:min-w-[17.25rem]={cols == 5}
      onblur={() => onNavEnd?.()}
    >
      {@render content?.()}
    </div>
  </label>
</div>

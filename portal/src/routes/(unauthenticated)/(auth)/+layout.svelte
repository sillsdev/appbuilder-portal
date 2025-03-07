<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }
  let { children }: Props = $props();
</script>

<div class="grid w-full h-full place-items-center place-content-center">
  <div>
    {@render children?.()}
  </div>
</div>

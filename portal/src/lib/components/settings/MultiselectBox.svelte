<script lang="ts">
  interface Props {
    header: string;
    children?: import('svelte').Snippet;
  }

  let { header, children }: Props = $props();
</script>

<div class="border border-opacity-15 border-gray-50 rounded-lg p-2">
  <div>
    <span>{header}</span>
  </div>
  {@render children?.()}
</div>

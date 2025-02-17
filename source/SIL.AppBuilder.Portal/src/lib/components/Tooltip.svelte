<script lang="ts">
  interface Props {
    tip: string | null | undefined;
    className?: string; // TODO: Add snippet support once we have DaisyUI 5
    children?: import('svelte').Snippet;
  }

  let { tip, className = '', children }: Props = $props();
  
</script>

<span class="tooltip tooltip-secondary {className}" data-tip={tip}>
  {@render children?.()}
</span>

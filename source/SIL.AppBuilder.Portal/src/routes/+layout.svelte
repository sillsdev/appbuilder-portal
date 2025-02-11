<script lang="ts">
  import '../app.css';
  interface Props {
    children?: import('svelte').Snippet;
  }
  let { children }: Props = $props();
</script>

<div id="app-body" class="h-screen w-full flex flex-col">
  {@render children?.()}
</div>

<style lang="postcss">
  #app-body :global(h1) {
    @apply text-2xl font-bold p-8;
  }

  #app-body :global(h2) {
    @apply text-xl font-bold p-4;
  }

  #app-body :global(h3) {
    @apply text-lg font-bold p-2;
  }

  #app-body :global(.dropdown-content) {
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
  }
  #app-body :global(a.link) {
    color: #55f;
  }
  #app-body :global(*) {
    font-size: 15px;
  }
</style>

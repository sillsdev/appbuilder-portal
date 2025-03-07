<script lang="ts">
  import { ParaglideJS } from '@inlang/paraglide-sveltekit';
  import { i18n } from '$lib/i18n';

  import '../app.css';
  interface Props {
    children?: import('svelte').Snippet;
  }
  let { children }: Props = $props();
</script>

<ParaglideJS {i18n}>
  <div class="h-screen w-full flex flex-col">
    {@render children?.()}
  </div>
</ParaglideJS>

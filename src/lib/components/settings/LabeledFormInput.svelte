<!--
    @component
    An input slot for a form (stylized)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ValueKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props extends ValueKey {
    children?: Snippet;
  }

  let { key, params = {}, classes = '', children }: Props = $props();
</script>

<label class="flex flex-col w-full {classes}">
  <div class="label">
    <span class="fieldset-label">
      <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
      {m[key](params as any)}
    </span>
  </div>
  {@render children?.()}
</label>

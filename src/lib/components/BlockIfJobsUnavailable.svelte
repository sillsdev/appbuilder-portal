<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import { page } from '$app/state';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';

  interface Props {
    altContent: Snippet;
    children: Snippet;
    class?: ClassValue;
  }
  let { altContent, children, class: classes }: Props = $props();
</script>

{#if page.data.jobsAvailable}
  {@render children()}
{:else}
  <button
    class={[classes, 'opacity-30 cursor-not-allowed']}
    type="button"
    onclick={() => toast('warning', m.system_unavailable())}
  >
    {@render altContent()}
  </button>
{/if}

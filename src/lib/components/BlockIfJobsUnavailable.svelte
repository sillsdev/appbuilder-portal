<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';

  interface Props {
    altContent: Snippet;
    children: Snippet;
    className?: string;
  }
  let { altContent, children, className }: Props = $props();
</script>

{#if page.data.jobsAvailable}
  {@render children()}
{:else}
  <button
    class="{className} opacity-30 cursor-not-allowed"
    type="button"
    onclick={() => toast('warning', m.system_unavailable())}
  >
    {@render altContent()}
  </button>
{/if}

<script lang="ts">
  import { type Snippet, onMount, untrack } from 'svelte';
  import type { LayoutData } from './$types';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { RouteId } from '$app/types';
  import { localizeUrl } from '$lib/paraglide/runtime';
  import { orgActive } from '$lib/stores';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { children }: Props = $props();

  onMount(() => {
    if (page.params.id && $orgActive !== parseInt(page.params.id)) {
      $orgActive = parseInt(page.params.id);
    }
  });

  type baseRouteId = '/(authenticated)/organizations/[id=idNumber]' & RouteId;

  $effect(() => {
    if ($orgActive) {
      const id = untrack(() => page.route.id!);
      goto(localizeUrl(resolve(id as baseRouteId, { id: String($orgActive) })), {
        invalidate: ['org:id:layout']
      });
    } else {
      goto(localizeUrl(`/organizations`));
    }
  });
</script>

{@render children?.()}

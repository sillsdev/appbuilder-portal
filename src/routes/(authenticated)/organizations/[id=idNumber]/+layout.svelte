<script lang="ts">
  import { type Snippet, onMount, untrack } from 'svelte';
  import type { LayoutData } from './$types';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { RouteId } from '$app/types';
  import { orgActive } from '$lib/stores';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { isAdminForOrg } from '$lib/utils/roles';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  type baseRouteId = '/(authenticated)/organizations/[id=idNumber]' & RouteId;

  onMount(() => {
    setOrgFromParams($orgActive, page.params.id);
  });

  $effect(() => {
    if (data.organizations.length > 1) {
      const id = untrack(() => page.route.id!);
      if (
        !selectGotoFromOrg(
          !!$orgActive && isAdminForOrg($orgActive, data.session.user.roles),
          resolve(id as baseRouteId, { id: String($orgActive) }),
          '/organizations',
          {
            invalidate: ['org:id:layout']
          }
        )
      ) {
        setOrgFromParams($orgActive, page.params.id);
      }
    } else if (data.organizations.length === 1) {
      setOrgFromParams($orgActive, '' + data.organizations[0].Id);
    }
  });
</script>

{@render children?.()}

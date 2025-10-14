<script lang="ts">
  import { type Snippet, onMount, untrack } from 'svelte';
  import type { LayoutData } from './$types';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { RouteId } from '$app/types';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeUrl } from '$lib/paraglide/runtime';
  import { orgActive } from '$lib/stores';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  onMount(() => {
    if (page.params.id && $orgActive !== parseInt(page.params.id)) {
      $orgActive = parseInt(page.params.id);
    }
  });

  const baseRouteId = '/(authenticated)/organizations/[id=idNumber]/settings' satisfies RouteId;

  $effect(() => {
    if ($orgActive) {
      const id = untrack(() => page.route.id!);
      goto(localizeUrl(resolve(id as typeof baseRouteId, { id: String($orgActive) })));
    } else {
      goto(localizeUrl(`/organizations`));
    }
  });
</script>

<TabbedMenu
  {baseRouteId}
  routeParams={{ id: page.params.id! }}
  menuItems={[
    {
      text: m.org_navBasic(),
      route: 'info'
    },
    {
      text: m.org_navProducts(),
      route: 'products'
    },
    {
      text: m.org_navStores(),
      route: 'stores'
    },
    {
      text: m.org_navGroups(),
      route: 'groups'
    },
    {
      text: m.org_navInfrastructure(),
      route: 'infrastructure'
    }
  ]}
>
  {#snippet title()}
    <div class="w-full">
      <h1 class="p-4 pl-3 pb-0 [text-wrap:nowrap]">
        {m.org_settingsTitle()}
      </h1>
      <h2>{data.organization.Name}</h2>
    </div>
  {/snippet}
  {@render children?.()}
</TabbedMenu>

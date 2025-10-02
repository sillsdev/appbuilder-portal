<script lang="ts">
  import { type Snippet, onMount, untrack } from 'svelte';
  import type { LayoutData } from './$types';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { m } from '$lib/paraglide/messages';
  import { deLocalizeUrl, localizeUrl } from '$lib/paraglide/runtime';
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

  $effect(() => {
    if ($orgActive) {
      const url = untrack(() => page.url);
      const current = deLocalizeUrl(url).toString().split('/');
      current[4] = '' + $orgActive;
      goto(localizeUrl(current.join('/')));
    } else {
      goto(localizeUrl(`/organizations`));
    }
  });
</script>

<TabbedMenu
  base="{base}/organizations/{page.params.id}/settings"
  routeId="/(authenticated)/organizations/[id]/settings"
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

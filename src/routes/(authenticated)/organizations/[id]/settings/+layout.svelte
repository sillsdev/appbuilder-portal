<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import { m } from '$lib/paraglide/messages';
  import OrganizationDropdown from '$lib/components/OrganizationDropdown.svelte';
  import { goto } from '$app/navigation';
  import { getLocale, localizeUrl } from '$lib/paraglide/runtime';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  let selectedOrg = $state(data.organization.Id);
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
      <h2>
        <OrganizationDropdown bind:value={selectedOrg} organizations={data.organizations} onchange={() => {
          let currentRoute = page.route.id?.split('/') ?? [];
          currentRoute[3] = ''+selectedOrg;
          goto(localizeUrl(currentRoute?.slice(2).join('/') ?? '/'))}} />
      </h2>
    </div>
  {/snippet}
  {@render children?.()}
</TabbedMenu>

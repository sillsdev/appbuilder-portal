<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { LayoutData } from './$types';

  let userSettingsLinks = [
    { text: m.users_userProfile(), route: 'profile' },
    { text: m.users_userRoles(), route: 'roles' },
    { text: m.users_userGroups(), route: 'groups' }
  ];

  interface Props {
    data: LayoutData;
    children?: import('svelte').Snippet;
  }

  let { data, children }: Props = $props();
  // route permissions are handled for individual subroutes
</script>

<!-- permissions handled in server -->
{#if data.canEdit}
  <TabbedMenu
    routeId="/(authenticated)/users/[id=idNumber]/settings"
    base="{base}/users/{page.params.id}/settings"
    titleString={m.users_settingsTitle() + ': ' + data.username}
    menuItems={userSettingsLinks}
  >
    {@render children?.()}
  </TabbedMenu>
{:else}
  <h1>{m.profile_title()}: {data.username}</h1>
  {@render children?.()}
{/if}

<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import TabbedMenu from '$lib/components/settings/TabbedMenu.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { LayoutData } from './$types';

  let userSettingsLinks = [
    { text: m.users_userProfile(), route: 'profile' },
    { text: m.users_userRoles(), route: 'roles' },
    { text: m.users_userGroups(), route: 'groups' }
  ];

  export let data: LayoutData;
  // TODO: route must be permission protected
</script>

<TabbedMenu
  routeId="/(authenticated)/users/[id=idNumber]/settings"
  base="{base}/users/{$page.params.id}/settings"
  title={m.users_settingsTitle() + ': ' + data.username}
  menuItems={userSettingsLinks}
>
  <slot />
</TabbedMenu>

<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { HamburgerIcon } from '$lib/icons';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import { SignIn } from '@auth/sveltekit/components';

  let drawerToggle: HTMLInputElement;
  function closeDrawer() {
    drawerToggle.click();
  }

  $: organization = 1;
  // $: console.log($page.data);

  function isActive(currentRoute: string | null, menuRoute: string) {
    return currentRoute?.startsWith(`${base}/(authenticated)${menuRoute}`);
  }
</script>

<div class="shrink-0 navbar bg-[#1C3258]">
  <div class="navbar-start">
    <label
      for="primary-content-drawer"
      class="btn btn-ghost btn-circle p-1 drawer-button lg:hidden"
    >
      <HamburgerIcon color="white" />
    </label>
    <p class="uppercase text-white lg:ps-4">{$_('appName')}</p>
    <!-- <p>SCRIPTORIA</p> -->
  </div>
  <div class="navbar-end">
    <LanguageSelector />
  </div>
</div>
<div class="flex grow min-h-0">
  <div class="flex overflow-auto drawer lg:drawer-open">
    <input
      id="primary-content-drawer"
      type="checkbox"
      class="drawer-toggle"
      bind:this={drawerToggle}
    />

    <div class="h-full drawer-side shrink-0 z-10">
      <label for="primary-content-drawer" class="drawer-overlay" />
      <ul
        class="menu menu-lg mt-16 lg:mt-0 rounded-r-xl p-0 w-full min-[480px]:w-1/2 min-[720px]:w-1/3 lg:border-r-2 lg:w-72 bg-base-100 text-base-content h-full"
      >
        <li>
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/tasks')}
            href="{base}/tasks"
            on:click={closeDrawer}
          >
            {$_('sidebar.myTasks', { values: { count: 1 } })}
          </a>
        </li>
        <li>
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/projects/own')}
            href="{base}/projects/own"
            on:click={closeDrawer}
          >
            {$_('sidebar.myProjects')}
          </a>
        </li>
        <li>
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/projects/organization')}
            href="{base}/projects/organization"
            on:click={closeDrawer}
          >
            {$_('sidebar.organizationProjects')}
          </a>
        </li>
        <li>
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/projects/active')}
            href="{base}/projects/active"
            on:click={closeDrawer}
          >
            {$_('sidebar.activeProjects')}
          </a>
        </li>
        <li>
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/users')}
            href="{base}/users"
            on:click={closeDrawer}
          >
            {$_('sidebar.users')}
          </a>
        </li>
        <li>
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/organizations/[id]/settings')}
            href="{base}/organizations/{organization}/settings"
            on:click={closeDrawer}
          >
            {$_('sidebar.organizationSettings')}
          </a>
        </li>
        <li>
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/admin/settings')}
            href="{base}/admin/settings/organizations"
            on:click={closeDrawer}
          >
            {$_('sidebar.adminSettings')}
          </a>
        </li>
        <li class="menu-item-divider-top menu-item-divider-bottom">
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/directory')}
            href="{base}/directory"
            on:click={closeDrawer}
          >
            {$_('sidebar.projectDirectory')}
          </a>
        </li>
        <li>
          <a
            class="rounded-none"
            class:active-menu-item={isActive($page.route.id, '/open-source')}
            href="{base}/open-source"
            on:click={closeDrawer}
          >
            {$_('opensource')}
          </a>
        </li>
      </ul>
    </div>
    <div class="drawer-content grow flex flex-row items-start justify-start">
      <slot />
    </div>
  </div>
</div>

<style>
  .navbar {
    padding: 0px;
    height: 4rem;
    min-height: 3rem;
  }
  .menu-item-divider-bottom {
    border-bottom: 2px solid #e5e5e5;
  }
  .menu-item-divider-top {
    border-top: 2px solid #e5e5e5;
  }

  .active-menu-item {
    border-left: 5px solid #1c3258; /* Adjust the border color and width to your preferences */
    font-weight: bold;
  }
</style>

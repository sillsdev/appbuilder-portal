<script lang="ts">
  import { dev } from '$app/environment';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import { HamburgerIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { deLocalizeUrl, localizeHref } from '$lib/paraglide/runtime';
  import { isAdmin, isSuperAdmin } from '$lib/utils/roles';
  import { signOut } from '@auth/sveltekit/client';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  let drawerToggle: HTMLInputElement;
  function closeDrawer() {
    drawerToggle.click();
  }

  function isUrlActive(route: string) {
    return deLocalizeUrl(page.url).pathname?.startsWith(`${base}${route}`);
  }
</script>

<svelte:head>
  <title>
    {m.tabAppName({ count: data.numberOfTasks })}{dev ? ' - SvelteKit' : ''}
  </title>
</svelte:head>

<div class="shrink-0 navbar bg-[#1c3258]">
  <div class="navbar-start">
    <label
      for="primary-content-drawer"
      class="btn btn-ghost btn-circle p-1 drawer-button lg:hidden"
    >
      <HamburgerIcon color="white" />
    </label>
    <p class="uppercase text-white lg:ps-4">{m.appName()}</p>
    <!-- <p>SCRIPTORIA</p> -->
  </div>
  <div class="navbar-end">
    <LanguageSelector />
    <Dropdown
      dropdownClasses="dropdown-end"
      labelClasses="m-2 p-2 rounded-xl"
      contentClasses="w-36 overflow-y-auto"
    >
      {#snippet label()}
        <img
          src={page.data.session?.user?.image}
          alt="User profile"
          referrerpolicy="no-referrer"
          class="h-full rounded-xl"
        />
      {/snippet}
      {#snippet content()}
        <ul class="menu menu-compact gap-1 p-2">
          <li>
            <a
              href={localizeHref(
                `/users/${page.data.session?.user?.userId ?? ''}/settings/profile`
              )}
            >
              {m.header_myProfile()}
            </a>
          </li>
          <li>
            <a target="_blank" href="https://community.scripture.software.sil.org/c/scriptoria/24">
              {m.header_community()}
            </a>
          </li>
          <li>
            <a target="_blank" href="https://scriptoria.io/docs/Help+Guide+for+Scriptoria.pdf">
              {m.header_help()}
            </a>
          </li>
          <li>
            <button onclick={() => signOut({ callbackUrl: '/' })}>{m.header_signOut()}</button>
          </li>
        </ul>
      {/snippet}
    </Dropdown>
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
      <label for="primary-content-drawer" class="drawer-overlay"></label>
      <div
        class="h-full mt-16 lg:mt-0 overflow-hidden w-full lg:w-72 lg:border-r min-[480px]:w-1/2 min-[720px]:w-1/3"
      >
        <ul class="menu menu-lg p-0 w-full bg-base-100 text-base-content h-full">
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isUrlActive('/tasks')}
              href={localizeHref('/tasks')}
              onclick={closeDrawer}
            >
              {m.sidebar_myTasks({ count: data.numberOfTasks })}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isUrlActive('/projects/own')}
              href={localizeHref('/projects/own')}
              onclick={closeDrawer}
            >
              {m.sidebar_myProjects()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isUrlActive('/projects/organization')}
              href={localizeHref('/projects/organization')}
              onclick={closeDrawer}
            >
              {m.sidebar_organizationProjects()}
            </a>
          </li>
          {#if isAdmin(page.data.session?.user.roles)}
            <li>
              <a
                class="rounded-none"
                class:active-menu-item={isUrlActive('/projects/active')}
                href={localizeHref('/projects/active')}
                onclick={closeDrawer}
              >
                {m.sidebar_activeProjects()}
              </a>
            </li>
            <li>
              <a
                class="rounded-none"
                class:active-menu-item={isUrlActive('/users')}
                href={localizeHref('/users')}
                onclick={closeDrawer}
              >
                {m.sidebar_users()}
              </a>
            </li>
            <li>
              <a
                class="rounded-none"
                class:active-menu-item={isUrlActive('/organizations')}
                href={localizeHref('/organizations')}
                onclick={closeDrawer}
              >
                {m.sidebar_organizationSettings()}
              </a>
            </li>
          {/if}
          {#if isSuperAdmin(page.data.session?.user.roles)}
            <li>
              <a
                class="rounded-none"
                class:active-menu-item={isUrlActive('/admin/settings')}
                href={localizeHref('/admin/settings/organizations')}
                onclick={closeDrawer}
              >
                {m.sidebar_adminSettings()}
              </a>
            </li>
            <li>
              <a
                class="rounded-none"
                href={dev ? 'http://localhost:3000' : '/admin/jobs'}
                onclick={closeDrawer}
                target="_blank"
              >
                {m.sidebar_jobAdministration()}
              </a>
            </li>
            <li>
              <a
                class="rounded-none"
                class:active-menu-item={isUrlActive('/workflow-instances')}
                href={localizeHref('/workflow-instances')}
                onclick={closeDrawer}
              >
                {m.workflowInstances_title()}
              </a>
            </li>
          {/if}
          <li class="menu-item-divider-top menu-item-divider-bottom">
            <a
              class="rounded-none"
              class:active-menu-item={isUrlActive('/directory')}
              href={localizeHref('/directory')}
              onclick={closeDrawer}
            >
              {m.sidebar_projectDirectory()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none mt-10"
              class:active-menu-item={isUrlActive('/open-source')}
              href={localizeHref('/open-source')}
              onclick={closeDrawer}
            >
              {m.opensource()}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="drawer-content grow items-start justify-start">
      {@render children?.()}
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
    border-left: 5px solid var(--color-accent); /* Adjust the border color and width to your preferences */
    font-weight: bold;
  }
  :global(.signOutButton > button) {
    width: 100%;
  }
</style>

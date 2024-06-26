<script lang="ts">
  import * as m from "$lib/paraglide/messages"
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { HamburgerIcon } from '$lib/icons';
  import LanguageSelector from '$lib/components/LanguageSelector.svelte';
  import { signOut } from '@auth/sveltekit/client';
  import type { LayoutData } from './$types';
  import Icon from '@iconify/svelte';
  import { browser, dev } from '$app/environment';
  import { selectedOrganizationId } from '$lib/stores';

  export let data: LayoutData;

  let drawerToggle: HTMLInputElement;
  function closeDrawer() {
    drawerToggle.click();
  }
  $: if (!$selectedOrganizationId) $selectedOrganizationId = data.organizations[0].Id;
  $: organization = data.organizations.find((v) => v.Id === $selectedOrganizationId);

  let orgMenuOpen = false;
  // $: console.log($page.data);

  function isActive(currentRoute: string | null, menuRoute: string) {
    return currentRoute?.startsWith(`${base}/(authenticated)${menuRoute}`);
  }
</script>

<svelte:head>
  
  <title
    >{data.numberOfTasks ? m.tabAppName_other({ count: data.numberOfTasks }) : m.tabAppName_zero()}{dev ? ' - SvelteKit' : ''}</title
  >
</svelte:head>

<div class="shrink-0 navbar bg-[#1C3258]">
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
    <div class="dropdown dropdown-end">
      <!-- When .dropdown is focused, .dropdown-content is revealed making this actually interactive -->
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <div class="btn btn-ghost m-2 p-2 rounded-xl" tabindex="0">
        <img
          src={$page.data.session?.user?.image}
          alt="User profile"
          referrerpolicy="no-referrer"
          class="h-full rounded-xl"
        />
      </div>
      <div class="dropdown-content w-36 z-10 bg-base-200 rounded-md overflow-y-auto">
        <ul class="menu menu-compact gap-1 p-2">
          <li>
            <a href="/users/{$page.data.session?.user?.userId ?? ''}/edit"
              >{m.header_myProfile()}</a
            >
          </li>
          <li>
            <a target="_blank" href="https://community.scripture.software.sil.org/c/scriptoria/24"
              >{m.header_community()}</a
            >
          </li>
          <li>
            <a target="_blank" href="https://scriptoria.io/docs/Help+Guide+for+Scriptoria.pdf"
              >{m.header_help()}</a
            >
          </li>
          <li>
            <button on:click={() => signOut({ callbackUrl: '/' })}>{m.header_signOut()}</button>
          </li>
        </ul>
      </div>
    </div>
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
      <div
        class="h-full overflow-hidden w-full rounded-r-xl lg:w-72 lg:border-r-2 min-[480px]:w-1/2 min-[720px]:w-1/3"
      >
        <ul class="menu menu-lg mt-16 lg:mt-0 p-0 w-full bg-base-100 text-base-content h-full">
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/tasks')}
              href="{base}/tasks"
              on:click={closeDrawer}
            >
              {data.numberOfTasks ? m.sidebar_myTasks_other({ count: data.numberOfTasks }) : m.sidebar_myTasks_zero()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/projects/own')}
              href="{base}/projects/own"
              on:click={closeDrawer}
            >
              {m.sidebar_myProjects()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/projects/organization')}
              href="{base}/projects/organization"
              on:click={closeDrawer}
            >
              {m.sidebar_organizationProjects()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/projects/active')}
              href="{base}/projects/active"
              on:click={closeDrawer}
            >
              {m.sidebar_activeProjects()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/users')}
              href="{base}/users"
              on:click={closeDrawer}
            >
              {m.sidebar_users()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/organizations/[id]/settings')}
              href="{base}/organizations/{organization}/settings"
              on:click={closeDrawer}
            >
              {m.sidebar_organizationSettings()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/admin/settings')}
              href="{base}/admin/settings/organizations"
              on:click={closeDrawer}
            >
              {m.sidebar_adminSettings()}
            </a>
          </li>
          <li class="menu-item-divider-top menu-item-divider-bottom">
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/directory')}
              href="{base}/directory"
              on:click={closeDrawer}
            >
              {m.sidebar_projectDirectory()}
            </a>
          </li>
          <li>
            <a
              class="rounded-none"
              class:active-menu-item={isActive($page.route.id, '/open-source')}
              href="{base}/open-source"
              on:click={closeDrawer}
            >
              {m.opensource()}
            </a>
          </li>
        </ul>
        <ul
          class="menu menu-lg mt-16 lg:mt-0 p-0 w-full lg:w-72 bg-base-100 text-base-content h-full"
          style="transition: transform 0.15s; transform: translate(0, {orgMenuOpen
            ? '-100%'
            : '0'});"
        >
          {#each data.organizations as org}
            <li>
              <button
                class="rounded-none"
                on:click={() => {
                  $selectedOrganizationId = org.Id;
                  orgMenuOpen = false;
                }}
                class:active-menu-item={$selectedOrganizationId === org.Id}
              >
                <span class="w-8 h-8 bg-white mr-2 border-base-300">
                  {#if org?.LogoUrl}
                    <img src={org?.LogoUrl} alt="{org?.Name} logo" />
                  {:else}
                    &nbsp;
                  {/if}
                </span>
                {org.Name}
              </button>
            </li>
          {/each}
        </ul>
        {#if data.organizations.length > 1}
          <div class="[height:70px] w-full absolute bottom-0 bg-base-300">
            <div class="h-full flex flex-row items-center">
              <button
                tabindex="0"
                on:click={() => (orgMenuOpen = !orgMenuOpen)}
                class="flex items-center w-full p-4"
              >
                <span class="w-8 h-8 bg-white mr-2">
                  {#if organization?.LogoUrl}
                    <img src={organization?.LogoUrl} alt="{organization?.Name} logo" />
                  {:else}
                    &nbsp;
                  {/if}
                </span>
                <span class="">
                  {organization?.Name ?? 'No organization'}
                </span>
                <Icon
                  icon="gridicons:dropdown"
                  width="24"
                  style="transition: transform 0.15s; transform: rotate({orgMenuOpen
                    ? '180'
                    : '0'}deg)"
                />
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
    <div class="drawer-content grow items-start justify-start">
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
  :global(.signOutButton > button) {
    width: 100%;
  }
</style>

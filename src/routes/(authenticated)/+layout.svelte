<script lang="ts">
  import { signOut } from '@auth/sveltekit/client';
  import type { Prisma } from '@prisma/client';
  import { type Snippet, onMount } from 'svelte';
  import type { LayoutData } from './$types';
  import { dev } from '$app/environment';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import LocaleSelector from '$lib/components/LocaleSelector.svelte';
  import { HamburgerIcon } from '$lib/icons';
  import { createl10nMapFromEntries, l10nMap } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { deLocalizeUrl, getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { orgActive, userTasksSSE } from '$lib/stores';
  import { isAdminForAny, isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();

  let drawerToggle: HTMLInputElement;
  function closeDrawer() {
    if (drawerToggle.checked) {
      drawerToggle.click();
    }
  }

  function isUrlActive(route: string) {
    // originally prefixed with deprecated import base. Not neccessary unless we change config.kit.paths.base from default
    return deLocalizeUrl(page.url).pathname?.startsWith(route);
  }

  function activeOrgUrl(route: string) {
    return localizeHref($orgActive ? `${route}/${$orgActive}` : route);
  }

  $effect(() => {
    l10nMap.value = createl10nMapFromEntries(data.localizedNames);
  });

  $effect(() => {
    if ($orgActive && !data.organizations.find((o) => o.Id === $orgActive)) {
      $orgActive = data.organizations[0].Id;
    }
  });

  onMount(() => {
    if (!$orgActive && data.organizations.length === 1) {
      $orgActive = data.organizations[0].Id;
    }
  });

  const userTasksLength = $derived($userTasksSSE?.length ?? data.userTasks.length);

  let selectingOrg = $state(false);
  const selectedOrg = $derived(data.organizations.find((o) => o.Id === $orgActive));
</script>

<svelte:head>
  <title>
    {m.tabAppName({ count: userTasksLength })}{dev ? ' - SvelteKit' : ''}
  </title>
</svelte:head>

{#snippet orgDisplay(
  org?: Prisma.OrganizationsGetPayload<{ select: { LogoUrl: true; Id: true; Name: true } }>,
  textClasses?: string
)}
  {#if org?.LogoUrl}
    <img class="inline-block p-1 h-12 w-12" src={org.LogoUrl} alt="Logo" />
  {:else}
    <div class="inline-block p-1 h-12 w-12 align-middle">
      <div class="bg-white w-full h-full"></div>
    </div>
  {/if}
  <span class={textClasses ?? ''}>
    {org?.Name ?? m.org_allOrganizations()}
  </span>
{/snippet}

{#snippet orgListItem(
  org?: Prisma.OrganizationsGetPayload<{ select: { LogoUrl: true; Id: true; Name: true } }>
)}
  <li>
    <button
      class="rounded-none hover:bg-base-200 cursor-pointer"
      class:active-menu-item={$orgActive === (org?.Id ?? null)}
      onclick={() => {
        $orgActive = org?.Id ?? null;
        selectingOrg = false;
      }}
    >
      {@render orgDisplay(org)}
    </button>
  </li>
{/snippet}

<div class="flex flex-col h-full">
  <div class="flex grow overflow-auto drawer lg:drawer-open">
    <input
      id="primary-content-drawer"
      type="checkbox"
      class="drawer-toggle"
      bind:this={drawerToggle}
    />

    <div class="h-full drawer-side shrink-0 z-10">
      <label for="primary-content-drawer" class="drawer-overlay"></label>
      <div
        class="dark:border-gray-600 h-full mt-0 overflow-hidden w-full lg:w-72 lg:border-r min-[480px]:w-1/2 min-[720px]:w-1/3"
      >
        <ul class="menu menu-lg p-0 w-full bg-base-100 text-base-content h-full">
          <div class="min-h-full overflow-y-auto">
            <li
              class="dark:border-gray-600 border-y top-0 sticky z-10 bg-base-200 hover:bg-base-300 h-16"
            >
              <div class="flex flex-row flex-nowrap">
                {#if data.organizations.length > 1}
                  <button
                    class="rounded-none p-0 pl-2 cursor-pointer grow flex items-center"
                    onclick={() => (selectingOrg = !selectingOrg)}
                  >
                    {@render orgDisplay(selectedOrg, 'font-bold text-sm')}
                    <div
                      class="dropdown-icon"
                      class:open={selectingOrg}
                      class:hidden={data.organizations.length <= 1}
                    >
                      <IconContainer icon="gridicons:dropdown" width={24} />
                    </div>
                  </button>
                {:else}
                  <div class="rounded-none h-16 p-0 pl-2 grow flex items-center">
                    {@render orgDisplay(selectedOrg, 'font-bold text-sm')}
                  </div>
                {/if}
                <button
                  class="btn btn-ghost h-full lg:hidden"
                  type="button"
                  onclick={() => closeDrawer()}
                >
                  <IconContainer icon="mdi:close" width={16} class="opacity-80" />
                </button>
              </div>
            </li>
            {#if selectingOrg}
              {@render orgListItem()}
              <hr class="pt-2" />
              {#each data.organizations.toSorted((a, b) => byName(a, b, getLocale())) as org}
                {@render orgListItem(org)}
              {/each}
            {:else}
              <li>
                <a
                  class="rounded-none"
                  class:active-menu-item={isUrlActive('/tasks')}
                  href={localizeHref('/tasks')}
                  onclick={closeDrawer}
                >
                  {m.sidebar_myTasks({ count: userTasksLength })}
                </a>
              </li>
              <li>
                <a
                  class="rounded-none"
                  class:active-menu-item={isUrlActive('/projects/own')}
                  href={activeOrgUrl(`/projects/own`)}
                  onclick={closeDrawer}
                >
                  {m.sidebar_myProjects()}
                </a>
              </li>
              <li>
                <a
                  class="rounded-none"
                  class:active-menu-item={isUrlActive('/projects/organization')}
                  href={activeOrgUrl('/projects/organization')}
                  onclick={closeDrawer}
                >
                  {m.sidebar_orgProjects()}
                </a>
              </li>
              {#if $orgActive ? isAdminForOrg($orgActive, data.session.user.roles) : isAdminForAny(data.session.user.roles)}
                <li>
                  <a
                    class="rounded-none"
                    class:active-menu-item={isUrlActive('/projects/active')}
                    href={activeOrgUrl('/projects/active')}
                    onclick={closeDrawer}
                  >
                    {m.sidebar_activeProjects()}
                  </a>
                </li>
                <li>
                  <a
                    class="rounded-none"
                    class:active-menu-item={isUrlActive('/users')}
                    href={activeOrgUrl('/users/org')}
                    onclick={closeDrawer}
                  >
                    {m.sidebar_users()}
                  </a>
                </li>
                <li>
                  <a
                    class="rounded-none"
                    class:active-menu-item={isUrlActive('/organizations')}
                    href={activeOrgUrl('/organizations')}
                    onclick={closeDrawer}
                  >
                    {m.sidebar_orgSettings()}
                  </a>
                </li>
              {/if}
              {#if isSuperAdmin(data.session.user.roles)}
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
                  <BlockIfJobsUnavailable className="rounded-none">
                    {#snippet altContent()}
                      {m.sidebar_jobAdministration()}
                      <IconContainer icon="mdi:open-in-new" width="18" />
                    {/snippet}
                    <a
                      class="rounded-none"
                      href="/admin/jobs"
                      onclick={closeDrawer}
                      target="_blank"
                    >
                      {@render altContent?.()}
                    </a>
                  </BlockIfJobsUnavailable>
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
              <li class="dark:border-gray-600 border-y-2">
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
            {/if}
          </div>
        </ul>
      </div>
    </div>
    <div class="drawer-content grow items-start justify-start">
      <div class="navbar bg-[#1c3258]">
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
          <LocaleSelector />
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
                  <a
                    target="_blank"
                    href="https://community.scripture.software.sil.org/c/scriptoria/24"
                  >
                    {m.header_community()}
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href="https://app.scriptoria.io/docs/Help+Guide+for+Scriptoria.pdf"
                  >
                    {m.header_help()}
                  </a>
                </li>
                <li>
                  <button onclick={() => signOut({ redirectTo: '/', redirect: true })}>
                    {m.header_signOut()}
                  </button>
                </li>
              </ul>
            {/snippet}
          </Dropdown>
        </div>
      </div>
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
  .active-menu-item {
    border-left: 5px solid var(--color-accent); /* Adjust the border color and width to your preferences */
    font-weight: bold;
  }
  :global(.signOutButton > button) {
    width: 100%;
  }

  .dropdown-icon {
    transition: transform 0.15s;
    transform: rotate(0deg);
  }
  .dropdown-icon.open {
    transform: rotate(180deg);
  }
</style>

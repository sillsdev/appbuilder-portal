<script lang="ts">
  import { type FormResult, superForm } from 'sveltekit-superforms';
  import type { MinifiedUser } from '../../common';
  import type { PageData } from './$types';
  import { enhance as svk_enhance } from '$app/forms';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar, { focusSearchBar } from '$lib/components/SearchBar.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { isAdminForAny, isAdminForOrg } from '$lib/utils/roles';
  import { byName, byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const orgMap = $derived(new Map(data.organizations.map(({ Id, Name }) => [Id, Name])));
  const groupMap = $derived(new Map(data.groups.map(({ Id, Name }) => [Id, Name])));

  let users = $state(data.users);
  let count = $state(data.userCount);

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    invalidateAll: false,
    onChange(event) {
      if (!event.paths.includes('search')) {
        submit();
      }
    },
    onUpdate(event) {
      const data = event.result.data as FormResult<{
        query: { data: MinifiedUser[]; count: number };
      }>;
      if (event.form.valid && data.query) {
        users = data.query.data;
        count = data.query.count;
      }
    },
    onUpdated() {
      if ($form.search) {
        focusSearchBar();
      }
    }
  });

  afterNavigate((navigation) => {
    users = data.users;
    count = data.userCount;
  });

  $effect(() => {
    if (
      !selectGotoFromOrg(
        !!$orgActive && isAdminForOrg($orgActive, data.session.user.roles),
        `/users/org/${$orgActive}`,
        `/users/org`
      )
    ) {
      setOrgFromParams($orgActive, page.params.orgId);
    }
  });

  function getUserLockMessage(locked: boolean, success: boolean): string {
    if (success) {
      if (locked) {
        return m.users_acts_lock_success();
      }
      return m.users_acts_unlock_success();
    }
    if (locked) {
      return m.users_acts_lock_error();
    }
    return m.users_acts_unlock_error();
  }
</script>

{#snippet name(user: (typeof users)[0])}
  <div class="overflow-x-auto">
    <p>
      <a href={localizeHref(`/users/${user.I}/settings`)} class="link pb-2">
        {user.N}
      </a>
    </p>
    <p class="text-sm wrap-break-word">
      {user.E}
    </p>
  </div>
{/snippet}

{#snippet roles(org: (typeof users)[0]['O'][0], locale: string)}
  <div class="p-1">
    <span>
      <b>
        {orgMap.get(org.I)}
      </b>
    </span>
    <br />
    {org.R.map((role) => m.users_roles({ role }))
      .sort((a, b) => byString(a, b, locale))
      .join(', ') || m.users_noRoles()}
  </div>
{/snippet}

{#snippet groups(org: (typeof users)[0]['O'][0], locale: string)}
  <div class="p-1">
    <span>
      <b>
        {orgMap.get(org.I)}
      </b>
    </span>
    <br />
    {org.G.map((g) => groupMap.get(g))
      .sort((a, b) => byString(a, b, locale))
      .join(', ') || m.common_none()}
  </div>
{/snippet}

{#snippet lock(user: (typeof users)[0])}
  {@const disabled = data.session?.user.userId === user.I}
  <form
    method="POST"
    action="?/lock"
    use:svk_enhance={() => {
      return async ({ result, update }) => {
        await update({ reset: false, invalidateAll: false });
        toast(
          result.type === 'success' ? 'success' : 'error',
          getUserLockMessage(!user.A, result.type === 'success')
        );
      };
    }}
  >
    <input class="hidden" type="hidden" name="user" value={user.I} />
    <label class={['toggle', disabled && 'cursor-not-allowed opacity-50 pointer-events-none']}>
      <input
        {disabled}
        type="checkbox"
        name="active"
        aria-label={m.users_table_active()}
        bind:checked={user.A}
        onchange={(e) => {
          if (data.session?.user.userId !== user.I) {
            // @ts-expect-error Just submit the form
            e.currentTarget.parentElement?.requestSubmit();
          }
        }}
      />
      <IconContainer icon="mdi:lock" width={16} />
      <IconContainer icon="mdi:lock-open-variant" width={16} />
    </label>
  </form>
{/snippet}

<div class="w-full">
  <div class="flex flex-row place-content-between w-full flex-wrap items-center">
    <div class="flex flex-row items-center">
      <h1>{m.users_title()}</h1>
      {#if isAdminForAny(data.session?.user.roles)}
        <BlockIfJobsUnavailable class="btn btn-outline">
          {#snippet altContent()}
            <IconContainer icon="mdi:user-add" width="20" />
            <span>{m.orgMembership_title()}</span>
          {/snippet}
          <a href={localizeHref('/users/invite')} class="btn btn-outline">
            {@render altContent()}
          </a>
        </BlockIfJobsUnavailable>
      {/if}
    </div>
    <form
      method="POST"
      action="?/page"
      use:enhance
      class="flex flex-row flex-wrap place-content-end items-center p-2 gap-1 w-full md:w-auto"
    >
      <SearchBar bind:value={$form.search} class="w-full md:w-auto" requestSubmit={submit} />
    </form>
  </div>
  <div class="m-4 relative mt-0">
    <table class="w-full table-fixed sm:hidden">
      <thead>
        <tr class="border-b-2 text-left">
          <th>{m.users_table_name()}</th>
          <th></th>
          <th></th>
          <th class="w-20">{m.users_table_active()}</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user}
          {@const locale = getLocale()}
          {@const userOrgs = user.O.map((o) => ({ ...o, Name: orgMap.get(o.I) })).sort((a, b) =>
            byName(a, b, locale)
          )}
          <tr class="align-top no-border">
            <td class="p-2" colspan="3">
              {@render name(user)}
            </td>
            <td class="py-2">
              {@render lock(user)}
            </td>
          </tr>
          <tr class="align-top">
            <td class="py-2 pl-1" colspan="2">
              {#each userOrgs as org}
                {@render roles(org, locale)}
              {/each}
            </td>
            <td class="py-2" colspan="2">
              {#each userOrgs as org}
                {@render groups(org, locale)}
              {/each}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <table class="w-full hidden sm:d-table table-fixed">
      <thead>
        <tr class="border-b-2 text-left">
          <th>{m.users_table_name()}</th>
          <th>{m.users_table_role()}</th>
          <th>{m.users_table_groups()}</th>
          <th class="w-20">{m.users_table_active()}</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user}
          {@const locale = getLocale()}
          {@const userOrgs = user.O.map((o) => ({ ...o, Name: orgMap.get(o.I) })).sort((a, b) =>
            byName(a, b, locale)
          )}
          <tr class="align-top">
            <td class="p-2">
              {@render name(user)}
            </td>
            <td class="py-2">
              {#each userOrgs as org}
                {@render roles(org, locale)}
              {/each}
            </td>
            <td class="py-2">
              {#each userOrgs as org}
                {@render groups(org, locale)}
              {/each}
            </td>
            <td class="py-2">
              {@render lock(user)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <form
    method="POST"
    action="?/page"
    use:enhance
    class="m-4 pb-4 flex flex-row flex-wrap gap-2 place-content-center"
  >
    <Pagination bind:size={$form.page.size} total={count} bind:page={$form.page.page} />
  </form>
</div>

<style>
  tr:not(:last-child) {
    border-bottom: 1px solid;
    border-color: var(--color-base-content);
  }
  @media (width >= 40rem) {
    .sm\:d-table {
      display: table;
    }
  }
  tr.no-border {
    border: none;
  }
</style>

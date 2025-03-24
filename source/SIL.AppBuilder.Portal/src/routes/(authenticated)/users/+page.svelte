<script lang="ts">
  import { enhance as svk_enhance } from '$app/forms';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import OrganizationDropdown from '$lib/components/OrganizationDropdown.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import * as m from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { isAdmin } from '$lib/utils/roles';
  import { byName, byString } from '$lib/utils/sorting';
  import { superForm, type FormResult } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import type { MinifiedUser } from './common';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const orgMap = new Map(data.organizations.map(({ Id, Name }) => [Id, Name]));
  const groupMap = new Map(data.groups.map(({ Id, Name }) => [Id, Name]));

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
    }
  });

  const mobileSizing = 'w-full max-w-xs md:w-auto md:max-w-none';
</script>

<div class="w-full">
  <div class="flex flex-row place-content-between w-full flex-wrap items-center">
    <div class="flex flex-row items-center">
      <h1>{m.users_title()}</h1>
      {#if isAdmin(data.session?.user.roles)}
        <a href="/users/invite" class="btn btn-outline">
          <IconContainer icon="mdi:user-add" width="20" />
          <span>{m.organizationMembership_invite_create_inviteUserButtonTitle()}</span>
        </a>
      {/if}
    </div>
    <form
      method="POST"
      action="?/page"
      use:enhance
      class="flex flex-row flex-wrap place-content-end items-center p-2 gap-1"
    >
      {#if data.organizations.length > 1}
        {@const locale = getLocale()}
        <label class="flex flex-wrap items-center gap-x-2 {mobileSizing}">
          <span class="label-text">{m.users_organization_filter()}:</span>
          <OrganizationDropdown
            organizations={data.organizations}
            bind:value={$form.organizationId}
            className="grow"
            allowNull={true}
          />
        </label>
      {/if}
      <SearchBar bind:value={$form.search} className={mobileSizing} />
    </form>
  </div>
  <div class="m-4 relative mt-0">
    <table class="w-full">
      <thead>
        <tr class="border-b-2 text-left">
          <th>{m.users_table_columns_name()}</th>
          <th>{m.users_table_columns_role()}</th>
          <th>{m.users_table_columns_groups()}</th>
          <th>{m.users_table_columns_active()}</th>
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
              <p>
                <a href="/users/{user.I}/settings" class="link pb-2">
                  {user.N}
                </a>
              </p>
              <p class="text-sm overflow-hidden">
                {user.E?.replace('@', '\u200b@')}
              </p>
            </td>
            <td class="py-2">
              {#each userOrgs as org}
                <div class="p-1">
                  <span>
                    <b>
                      {orgMap.get(org.I)}
                    </b>
                  </span>
                  <br />
                  {org.R.map(
                    (r) =>
                      [
                        '',
                        m.users_roles_superAdmin(),
                        m.users_roles_orgAdmin(),
                        m.users_roles_appBuilder(),
                        m.users_roles_author()
                      ][r]
                  )
                    .sort((a, b) => byString(a, b, locale))
                    .join(', ') || m.users_noRoles()}
                </div>
              {/each}
            </td>
            <td class="py-2">
              {#each userOrgs as org}
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
              {/each}
            </td>
            <td class="py-2">
              <form
                method="POST"
                action="?/lock"
                class="form-control"
                use:svk_enhance={() => {
                  return async ({ update }) => {
                    await update({ reset: false, invalidateAll: false });
                  };
                }}
              >
                <input class="hidden" type="hidden" name="user" value={user.I} />
                <input
                  class="toggle"
                  disabled={data.session?.user.userId === user.I}
                  type="checkbox"
                  name="active"
                  bind:checked={user.A}
                  onchange={(e) => {
                    if (data.session?.user.userId !== user.I) {
                      //@ts-ignore
                      e.currentTarget.parentElement?.requestSubmit();
                      // Apparently full TS is not supported in this instance, otherwise I would just cast to HTMLFormElement
                    }
                  }}
                />
              </form>
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
  }
</style>

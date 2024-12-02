<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import { enhance as svk_enhance } from '$app/forms';
  import { writable } from 'svelte/store';
  import Pagination from '$lib/components/Pagination.svelte';
  import { superForm, type FormResult } from 'sveltekit-superforms';
  import type { MinifiedUser } from './common';

  export let data: PageData;

  const users = writable(data.users);
  const count = writable(data.userCount);

  const { form, enhance, submit } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
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
        users.set(data.query.data);
        count.set(data.query.count);
      }
    }
  });
</script>

<div class="w-full">
  <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
    <div class="inline-block">
      <h1 class="p-4 pl-6">{m.users_title()}</h1>
    </div>
    <form
      method="POST"
      action="?/page"
      use:enhance
      class="flex flex-row flex-wrap place-content-end items-center p-2 gap-1"
    >
      {#if data.organizationCount > 1}
        <label class="flex flex-wrap items-center gap-x-2 w-full max-w-xs md:w-auto md:max-w-none">
          <span class="label-text">{m.users_organization_filter()}:</span>
          <select class="select select-bordered grow" name="org" bind:value={$form.organizationId}>
            <option value={null}>{m.org_allOrganizations()}</option>
            {#each Object.entries(data.organizations) as [Id, Name]}
              <option value={Id}>{Name}</option>
            {/each}
          </select>
        </label>
      {/if}
      <SearchBar bind:value={$form.search} className="w-full max-w-xs md:w-auto md:max-w-none" />
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
        {#each $users as user}
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
              {#each user.O as org}
                <div class="p-1">
                  <span>
                    <b>
                      {data.organizations[org.I]}
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
                  ).join(', ') || m.users_noRoles()}
                </div>
              {/each}
            </td>
            <td class="py-2">
              {#each user.O as org}
                <div class="p-1">
                  <span>
                    <b>
                      {data.organizations[org.I]}
                    </b>
                  </span>
                  <br />
                  {org.G.map((g) => data.groups[g]).join(', ') || m.common_none()}
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
                  on:change={(e) => {
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
    <Pagination bind:size={$form.page.size} total={$count} bind:page={$form.page.page} />
  </form>
</div>

<style>
  tr:not(:last-child) {
    border-bottom: 1px solid;
  }
</style>

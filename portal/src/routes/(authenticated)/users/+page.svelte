<script lang="ts">
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;
  let selectedOrg: number = 0;
  let searchQuery = '';

  let forms: { [key: string]: any } = {};

  const timeouts = new Map<number, any>();
</script>

<div class="w-full">
  <div class="flex flex-row place-content-between align-middle flex-wrap items-center">
    <h1 class="pb-6">{m.users_title()}</h1>
    <!-- TODO i18n -->
    <div class="content-center m-4 space-x-2 flex flex-nowrap items-end">
      {#if data.organizations.length > 1}
        <span class="flex flex-wrap items-center gap-x-2">
          <span>Filter organization:</span>
          <select class="select select-bordered" name="org" bind:value={selectedOrg}>
            <option value={0}>Any organization</option>
            {#each data.organizations as organization}
              <option value={organization.Id}>{organization.Name}</option>
            {/each}
          </select>
        </span>
      {/if}
      <input
        placeholder={m.search()}
        type="text"
        class="input input-bordered"
        bind:value={searchQuery}
      />
    </div>
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
        {#each data.users
          .filter((u) => u.Name.includes(searchQuery) && u.Organizations.find((o) => o.Id === selectedOrg || selectedOrg === 0))
          .sort((a, b) => a.FamilyName.localeCompare(b.FamilyName)) as user}
          <tr class="align-top">
            <td class="p-2">
              <a href="/users/{user.Id}/settings" class="link">
                {user.Name}
              </a>
            </td>
            <td class="py-2">
              {#each user.Organizations as org}
                <div class="p-1">
                  <span>
                    <b>
                      {data.organizations.find((o) => o.Id === org.Id)?.Name}
                    </b>
                  </span>
                  <br />
                  {org.Roles.map(
                    (r) => ['', 'SuperAdmin', 'OrganizationAdmin', 'AppBuilder', 'Author'][r]
                  ).join(', ') || m.users_noRoles()}
                </div>
              {/each}
            </td>
            <td class="py-2">
              {#each user.Organizations as org}
                <div class="p-1">
                  <span>
                    <b>
                      {data.organizations.find((o) => o.Id === org.Id)?.Name}
                    </b>
                  </span>
                  <br />
                  {org.Groups.join(', ') || m.common_none()}
                </div>
              {/each}
            </td>
            <td>
              <form
                action="?/lock"
                method="post"
                use:enhance={() =>
                  ({ update }) =>
                    update({ reset: false })}
                bind:this={forms[user.Id]}
              >
                <input type="hidden" name="id" value={user.Id} />
                <input
                  name="enabled"
                  class="toggle toggle-info my-4"
                  type="checkbox"
                  checked={!user.IsLocked}
                  on:click={() => {
                    if (timeouts.has(user.Id)) {
                      clearTimeout(timeouts.get(user.Id));
                    }
                    timeouts.set(
                      user.Id,
                      setTimeout(() => {
                        timeouts.delete(user.Id);
                        forms[user.Id].requestSubmit();
                      }, 1000)
                    );
                  }}
                />
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  tr:not(:last-child) {
    border-bottom: 1px solid;
  }
</style>

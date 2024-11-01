<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
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
    <div
      class="content-center m-4 gap-2 flex flex-wrap items-end w-full place-content-between"
    >
      {#if data.organizations.length > 1}
        <label class="flex flex-wrap items-center gap-x-2">
          <span>{m.users_organization_filter()}:</span>
          <select class="select select-bordered" name="org" bind:value={selectedOrg}>
            <option value={0}>{m.org_allOrganizations()}</option>
            {#each data.organizations as organization}
              <option value={organization.Id}>{organization.Name}</option>
            {/each}
          </select>
        </label>
      {/if}
      <SearchBar bind:value={searchQuery} className="w-full max-w-xs md:w-auto md:max-w-none" />
    </div>
  </div>
  <div class="m-4 relative mt-0">
    <table class="w-full">
      <thead>
        <tr class="border-b-2 text-left">
          <th>{m.users_table_columns_name()}</th>
          <th>{m.users_table_columns_role()}</th>
          <th>{m.users_table_columns_groups()}</th>
        </tr>
      </thead>
      <tbody>
        {#each data.users
          .filter((u) => (u.Name.toLowerCase().includes(searchQuery.toLowerCase()) || u.Email?.toLowerCase().includes(searchQuery.toLowerCase())) && u.Organizations.find((o) => o.Id === selectedOrg || selectedOrg === 0))
          .sort((a, b) => a.FamilyName.localeCompare(b.FamilyName, languageTag())) as user}
          <tr class="align-top">
            <td class="p-2">
              <p>
                <a href="/users/{user.Id}/settings" class="link pb-2">
                  {user.Name}
                </a>
              </p>
              <p class="text-sm overflow-hidden">
                {user.Email?.replace('@', '\u200b@')}
              </p>
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

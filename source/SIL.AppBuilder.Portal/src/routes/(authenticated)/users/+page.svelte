<script lang="ts">
  import { enhance } from '$app/forms';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;

  let forms: { [key: string]: any } = {};

  const timeouts = new Map<number, any>();
</script>

<div class="w-full">
  <h1>{m.users_title()}</h1>
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
        {#each data.users.sort((a, b) => a.Id - b.Id) as user}
          <tr class="align-top">
            <td class="p-2">{user.Name}</td>
            <td class="py-2">
              {#each user.Organizations as org}
                <div class="p-1">
                  <span>
                    <b>
                      {org.Name}
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
                      {org.Name}
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

<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import IconContainer from '$lib/components/IconContainer.svelte';

  export let data: PageData;
  let selectedOrg: number = 0;
  let searchQuery = '';

  let forms: { [key: string]: any } = {};

  const timeouts = new Map<number, any>();
</script>

<div class="w-full">
  <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
    <div class="inline-block">
      <h1 class="p-4 pl-6">{m.users_title()}</h1>
    </div>
    <div class="flex flex-row place-content-end items-center ml-4">
      {#if data.organizationCount > 1}
        <label class="flex flex-wrap items-center gap-x-2">
          <!-- TODO: i18n (add to locale JSON) -->
          <span class="label-text">Filter organization:</span>
          <select class="select select-bordered" name="org" bind:value={selectedOrg}>
            <option value={0}>{m.org_allOrganizations()}</option>
            {#each Object.entries(data.organizations) as [Id, Name]}
              <option value={Id}>{Name}</option>
            {/each}
          </select>
        </label>
      {/if}
      <div class="p-4 relative">
        <input
          type="text"
          class="input grow shrink [max-width:20rem] input-bordered pr-9"
          placeholder={m.search()}
          bind:value={searchQuery}
        />
        <div class="absolute right-6 items-center align-middle h-full [top:1.7rem]">
          <IconContainer icon="mdi:search" width={24} />
        </div>
      </div>
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
        {#each data.users as user}
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
                    // TODO: i18n (these will need to be added to locale JSON)
                    (r) => ['', 'Super Admin', 'Organization Admin', 'App Builder', 'Author'][r]
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

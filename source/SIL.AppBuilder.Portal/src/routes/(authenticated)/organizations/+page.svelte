<script lang="ts">
  import { goto } from '$app/navigation';
  import { org_settingsTitle } from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="w-full max-w-6xl mx-auto">
  <h1 class="pl-7">{org_settingsTitle()}</h1>
  <div class="w-full px-4">
    <table class="w-full">
      <thead>
        <tr class="text-left">
          <th>Organization</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {#each data.organizations as org}
          <tr
            class="h-16 border-y hover:bg-gray-100 hover:dark:bg-gray-800 cursor-pointer"
            on:click={() => goto('/organizations/' + org.Id + '/settings/info')}
          >
            <td>
              {#if org.LogoUrl}
                <img class="inline-block p-2 h-16 w-16" src={org.LogoUrl} alt="Logo" />
              {:else}
                <div class="inline-block p-2 h-16 w-16 align-middle">
                  <div class="bg-white w-full h-full" />
                </div>
              {/if}
              <span>
                {org.Name}
              </span>
            </td>
            <td>
              {org.Owner.Name}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

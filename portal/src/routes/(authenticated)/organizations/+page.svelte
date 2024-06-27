<script lang="ts">
  import { goto } from '$app/navigation';
  import { org_settingsTitle } from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>{org_settingsTitle()}</h1>
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
          class="h-16 border-y"
          on:click={() => goto('/organizations/' + org.Id + '/settings/info')}
        >
          <td>
            <img class="inline-block p-2 h-16 w-16" src={org.LogoUrl} alt="Logo" />
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

<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="w-full max-w-6xl mx-auto">
  <h1 class="pl-7">{m.org_settingsTitle()}</h1>
  <div class="w-full px-4">
    <table class="w-full">
      <thead>
        <tr class="text-left">
          <th>{m.project_org()}</th>
          <th>{m.project_orgContact()}</th>
          <!-- <th>Projects</th> -->
        </tr>
      </thead>
      <tbody>
        {#each data.organizations.toSorted((a, b) => byName(a, b, getLocale())) as org}
          <tr
            class="h-16 border-y hover:bg-base-200 cursor-pointer"
            onclick={() => goto(page.url.pathname + '/' + org.Id + '/settings/info')}
          >
            <td>
              {#if org.LogoUrl}
                <img class="inline-block p-2 h-16 w-16" src={org.LogoUrl} alt="Logo" />
              {:else}
                <div class="inline-block p-2 h-16 w-16 align-middle">
                  <div class="bg-white w-full h-full"></div>
                </div>
              {/if}
              <span>
                {org.Name}
              </span>
            </td>
            <td>
              {#if org.ContactEmail}
                <a class="link" href="mailto:{org.ContactEmail}">{org.ContactEmail}</a>
              {:else}
                {m.common_notAvailable()}
              {/if}
            </td>
            <!-- <td>
              {org.Projects.length}
            </td> -->
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

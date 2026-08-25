<script lang="ts">
  import type { PageData } from './$types';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<h1 class="text-center px-0 text-base-100">{m.invitations_ourUsers()}</h1>
<div class="w-full max-w-6xl mx-auto bg-base-100 rounded-md">
  <table class="w-full table table-zebra">
    <thead>
      <tr class="text-left">
        <th>{m.project_org()}</th>
        <th>{m.project_orgContact()}</th>
      </tr>
    </thead>
    <tbody>
      {#each data.organizations.toSorted((a, b) => byName(a, b, getLocale())) as org}
        <tr class="h-16" aria-label={m.project_org() + ': ' + org.Name}>
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
              <a class="link" href="mailto:{org.ContactEmail}">
                {org.ContactEmail}
              </a>
            {:else}
              {m.common_notAvailable()}
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

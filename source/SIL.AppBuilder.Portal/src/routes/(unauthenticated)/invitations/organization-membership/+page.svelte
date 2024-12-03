<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="grid w-full h-full place-items-center place-content-center">
  <div class="card shadow-xl bg-base-100 border p-4 flex flex-column items-center">
    {#if data.error === 'not found'}
      <h2>{m.organizationMembership_invite_error_notFound()}</h2>
    {:else if data.error === 'redeemed'}
      <h2>{m.organizationMembership_invite_error_redeemed()}</h2>
    {:else if data.error === 'expired'}
      <h2>{m.organizationMembership_invite_error_expired()}</h2>
    {:else}
      <h2>{m.organizationMembership_invite_redemptionTitle()}</h2>
      <!-- Organization info -->
      <div class="flex flex-row">
        {#if data.joinedOrganization?.logoUrl}
          <img
            class="inline-block p-2 h-16 w-16"
            src={data.joinedOrganization.logoUrl}
            alt="Organization logo"
          />
        {:else}
          <div class="inline-block p-2 h-16 w-16 align-middle">
            <div class="bg-white w-full h-full" />
          </div>
        {/if}
        <div>
          <h3>{data.joinedOrganization?.name}</h3>
        </div>
      </div>
      <!-- TODO: i18n -->
      <a href="/tasks" class="btn btn-primary">
        {m.organizationMembership_invite_returnToDashboard()}
      </a>
    {/if}
  </div>
</div>

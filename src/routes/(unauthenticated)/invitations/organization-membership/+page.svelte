<script lang="ts">
  import type { PageData } from './$types';
  import ScriptoriaIcon from '$lib/icons/ScriptoriaIcon.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="card shadow-xl bg-white border p-4 flex flex-column items-center text-black">
  <div class="w-full flex justify-center">
    <div class="w-10"></div>
    <ScriptoriaIcon size="128" />
  </div>
  {#if data.error === 'not found'}
    <h2>{m.orgMembership_notFound()}</h2>
  {:else if data.error === 'redeemed'}
    <h2>{m.orgMembership_redeemed()}</h2>
  {:else if data.error === 'expired'}
    <h2>{m.orgMembership_expired()}</h2>
  {:else if !data.error}
    <h2>{m.orgMembership_joined()}</h2>
    <!-- Organization info -->
    <div class="flex flex-row mb-4 items-center">
      {#if data.joinedOrganization?.logoUrl}
        <img
          class="inline-block p-2 h-16 w-16"
          src={data.joinedOrganization.logoUrl}
          alt="Organization logo"
        />
      {/if}
      <div class="grow text-center">
        <h3>{data.joinedOrganization?.name}</h3>
      </div>
    </div>
    <a href={localizeHref('/tasks')} class="btn btn-primary" data-sveltekit-reload>
      {m.orgMembership_returnToDashboard()}
    </a>
  {:else}
    <h2>Unknown error {data.error}</h2>
  {/if}
</div>

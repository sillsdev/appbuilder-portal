<script lang="ts">
  import ScriptoriaIcon from '$lib/icons/ScriptoriaIcon.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="card shadow-xl bg-white border p-4 flex flex-column items-center text-black">
  {#if data.error === 'not found'}
    <h2>{m.orgMembership_notFound()}</h2>
  {:else if data.error === 'redeemed'}
    <h2>{m.orgMembership_redeemed()}</h2>
  {:else if data.error === 'expired'}
    <h2>{m.orgMembership_expired()}</h2>
  {:else}
    <div class="w-full flex justify-center">
      <div class="w-10"></div>
      <ScriptoriaIcon size="128" />
    </div>
    <h2>{m.orgMembership_joined()}</h2>
    <!-- Organization info -->
    <div class="flex flex-row">
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
    <a href={localizeHref('/tasks')} class="btn btn-primary">
      {m.orgMembership_returnToDashboard()}
    </a>
  {/if}
</div>

<script lang="ts">
  import type { PageData } from './$types';
  import { localizeHref } from '$lib/paraglide/runtime';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  function formatDate(value?: Date | string | null) {
    if (!value) return '—';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }
</script>

<div class="w-full p-4">
  <div class="flex items-center justify-between gap-3">
    <h1 class="text-2xl font-semibold">Support Data Request</h1>
    <a class="btn btn-ghost" href={localizeHref('/support-data')}>Back to list</a>
  </div>

  <div class="mt-6 card bg-base-200 shadow-sm">
    <div class="card-body gap-4">
      <div>
        <p class="text-sm opacity-70">Request ID</p>
        <p class="font-mono">{data.request.Id}</p>
      </div>
      <div>
        <p class="text-sm opacity-70">Ticket URL</p>
        {#if data.request.TicketUrl}
          <a class="link" href={data.request.TicketUrl} target="_blank" rel="noreferrer">
            {data.request.TicketUrl}
          </a>
        {:else}
          <p>—</p>
        {/if}
      </div>
      <div>
        <p class="text-sm opacity-70">Agent</p>
        <p>{data.request.Agent?.Name ?? data.request.Agent?.Email ?? `User ${data.request.AgentId}`}</p>
      </div>
      <div>
        <p class="text-sm opacity-70">Date uploaded</p>
        <p>{formatDate(data.request.DateUploaded)}</p>
      </div>
    </div>
  </div>
</div>

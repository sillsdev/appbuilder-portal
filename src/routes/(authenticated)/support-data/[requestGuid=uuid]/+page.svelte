<script lang="ts">
  import type { PageData } from './$types';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
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

<div class="relative mx-auto w-full max-w-6xl p-4">
  <div class="flex flex-wrap items-start gap-4">
    <div class="grow">
      <h1 class="p-0">{data.request.Name}</h1>
      <p class="font-mono text-sm opacity-70">{data.request.Id}</p>
    </div>
    <div class="flex gap-2">
      <a
        class="btn btn-secondary"
        href={localizeHref(`/support-data/${data.request.Id}/edit`)}
        title="Edit request"
      >
        <IconContainer width={20} icon={Icons.Edit} />
        Edit request
      </a>
      <a class="btn btn-secondary" href={localizeHref('/support-data')}>Back to list</a>
    </div>
  </div>

  <section class="mt-6">
    <h2 class="pl-0">Request information</h2>
    <div class="grid gap-x-6 gap-y-3 md:grid-cols-2">
      <div>
        <p class="font-semibold">Agent</p>
        <p>
          <IconContainer icon={Icons.User} width={20} class="mr-1" />
          {data.request.Agent?.Name ?? data.request.Agent?.Email ?? `User ${data.request.AgentId}`}
        </p>
      </div>
      <div>
        <p class="font-semibold">Date uploaded</p>
        <p>
          <IconContainer icon={Icons.DateRange} width={20} class="mr-1" />{formatDate(
            data.request.DateUploaded
          )}
        </p>
      </div>
    </div>
    {#if data.request.Description}
      <div class="mt-4">
        <p class="font-semibold">Description</p>
        <p class="whitespace-pre-wrap">{data.request.Description}</p>
      </div>
    {/if}
  </section>

  <section class="mt-6">
    <h2 class="pl-0">Support ticket</h2>
    {#if data.request.TicketUrl}
      <a
        class="block break-all rounded-md bg-base-200 p-3"
        href={data.request.TicketUrl}
        target="_blank"
        rel="noreferrer"
      >
        <IconContainer icon={Icons.URL} width={20} class="mr-1 inline-block" />
        {data.request.TicketUrl}
      </a>
    {:else}
      <p>—</p>
    {/if}
  </section>
</div>

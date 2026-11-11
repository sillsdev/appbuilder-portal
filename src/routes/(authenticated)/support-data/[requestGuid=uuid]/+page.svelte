<script lang="ts">
  import type { PageData } from './$types';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
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
        title={m.supportData_editRequest()}
      >
        <IconContainer width={20} icon={Icons.Edit} />
        {m.supportData_editRequest()}
      </a>
      <a class="btn btn-secondary" href={localizeHref('/support-data')}>
        {m.supportData_backToList()}
      </a>
    </div>
  </div>

  <section class="mt-6">
    <h2 class="pl-0">{m.supportData_requestInformation()}</h2>
    <div class="grid gap-x-6 gap-y-3 md:grid-cols-2">
      <div>
        <p class="font-semibold">{m.project_org()}</p>
        <p>{data.request.Organization.Name}</p>
      </div>
      <div>
        <p class="font-semibold">{m.supportData_agent()}</p>
        <p>
          <IconContainer icon={Icons.User} width={20} class="mr-1" />
          {data.request.Agent?.Name ??
            data.request.Agent?.Email ??
            m.supportData_userFallback({ id: data.request.AgentId })}
        </p>
      </div>
      <div>
        <p class="font-semibold">{m.supportData_dateUploaded()}</p>
        <p>
          <IconContainer icon={Icons.DateRange} width={20} class="mr-1" />{getTimeDateString(
            data.request.DateUploaded
          )}
        </p>
      </div>
    </div>
    {#if data.request.Description}
      <div class="mt-4">
        <p class="font-semibold">{m.common_description()}</p>
        <p class="whitespace-pre-wrap">{data.request.Description}</p>
      </div>
    {/if}
  </section>

  <section class="mt-6">
    <h2 class="pl-0">{m.supportData_supportTicket()}</h2>
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

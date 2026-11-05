<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { localizeHref } from '$lib/paraglide/runtime';

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  function formatDate(value?: Date | string | null) {
    if (!value) return '—';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }
</script>

<div class="relative mx-auto w-full max-w-6xl p-4">
  <h1 class="p-0">Edit Support Data Request</h1>
  <p class="font-mono text-sm opacity-70">{data.request.Id}</p>

  {#if form?.message}
    <div class="alert alert-error my-4" role="alert">{form.message}</div>
  {/if}

  <form method="POST" class="maingrid mt-4 grid w-full">
    <!-- Editable fields -->
    <div class="mainarea card min-w-0 overflow-hidden rounded-md border border-slate-400">
      <div class="bg-neutral">
        <h2>Request details</h2>
      </div>
      <div class="flex flex-col gap-2 p-4">
        <label class="flex w-full flex-col">
          <span class="fieldset-label mb-1">Request name</span>
          <input
            class="input validator w-full"
            name="name"
            type="text"
            required
            maxlength="200"
            value={form?.values?.name ?? data.request.Name}
          />
          <span class="validator-hint">Enter a name for this request.</span>
        </label>
        <label class="flex w-full flex-col">
          <span class="fieldset-label mb-1">Ticket URL</span>
          <input
            class="input validator w-full"
            name="ticketUrl"
            type="url"
            required
            value={form?.values?.ticketUrl ?? data.request.TicketUrl ?? ''}
          />
          <span class="validator-hint">Enter a valid ticket URL.</span>
        </label>
        <label class="flex w-full flex-col">
          <span class="fieldset-label mb-1">Description</span>
          <textarea
            class="textarea h-48 w-full"
            name="description"
            maxlength="5000"
            placeholder="Add relevant context, symptoms, and troubleshooting details"
            value={form?.values?.description ?? data.request.Description ?? ''}
          ></textarea>
        </label>
      </div>
    </div>

    <!-- Read-only info, styled like the project page's Organization/Owner card -->
    <div class="sidebararea card h-fit min-w-0 rounded-md border border-slate-400 bg-neutral">
      <div class="flex flex-col py-4">
        <div class="flex flex-col px-4">
          <span class="flex items-center gap-x-1">
            <IconContainer icon={Icons.Organization} width={20} />
            Organization
          </span>
          <span class="text-right">{data.request.Organization.Name}</span>
        </div>
        <div class="divider my-2"></div>
        <div class="flex flex-col px-4">
          <span class="flex items-center gap-x-1">
            <IconContainer icon={Icons.User} width={20} />
            Agent
          </span>
          <span class="text-right">
            {data.request.Agent?.Name ??
              data.request.Agent?.Email ??
              `User ${data.request.AgentId}`}
          </span>
        </div>
        <div class="divider my-2"></div>
        <div class="flex flex-col px-4">
          <span class="flex items-center gap-x-1">
            <IconContainer icon={Icons.DateRange} width={20} />
            Date uploaded
          </span>
          <span class="text-right">{formatDate(data.request.DateUploaded)}</span>
        </div>
      </div>
    </div>

    <div class="actionsarea flex flex-row flex-wrap place-content-center gap-4 p-4">
      <CancelButton
        returnTo={localizeHref(`/support-data/${data.request.Id}`)}
        class="w-full max-w-xs"
      />
      <SubmitButton class="w-full max-w-xs">Save changes</SubmitButton>
    </div>
  </form>
</div>

<style>
  .maingrid {
    grid-template-areas:
      'main sidebar'
      'actions sidebar';
    grid-template-columns: 2fr 1fr;
    column-gap: 0.75rem;
    row-gap: 0.75rem;
  }
  .mainarea {
    grid-area: main;
  }
  .sidebararea {
    grid-area: sidebar;
  }
  .actionsarea {
    grid-area: actions;
  }
  @media (max-width: 700px) {
    .maingrid {
      grid-template-columns: 1fr;
      grid-template-areas:
        'sidebar'
        'main'
        'actions';
    }
  }
</style>

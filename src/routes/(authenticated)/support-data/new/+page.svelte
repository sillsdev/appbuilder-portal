<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
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
</script>

<div class="relative mx-auto w-full max-w-6xl p-4">
  <h1 class="p-0">New Support Data Request</h1>

  {#if form?.message}
    <div class="alert alert-error my-4" role="alert">{form.message}</div>
  {/if}

  <form method="POST" use:enhance class="maingrid mt-4 grid w-full">
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
            placeholder="Short summary of the support request"
            value={form?.values?.name ?? ''}
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
            placeholder="https://support.example.com/tickets/123"
            value={form?.values?.ticketUrl ?? ''}
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
            value={form?.values?.description ?? ''}
          ></textarea>
        </label>
      </div>
    </div>

    <!-- Organization, styled like the project page's Organization/Owner card -->
    <div class="sidebararea card h-fit min-w-0 rounded-md border border-slate-400 bg-neutral">
      <label class="flex flex-col gap-2 p-4">
        <span class="flex items-center gap-x-1">
          <IconContainer icon={Icons.Organization} width={20} />
          Organization
        </span>
        <select class="select w-full" name="organizationId" required>
          <option value="">Select an organization</option>
          {#each data.organizations as organization}
            <option
              value={organization.Id}
              selected={form?.values?.organizationId === organization.Id}
            >
              {organization.Name}
            </option>
          {/each}
        </select>
      </label>
    </div>

    <div class="actionsarea flex flex-row flex-wrap place-content-center gap-4 p-4">
      <CancelButton returnTo={localizeHref('/support-data')} class="w-full max-w-xs" />
      <SubmitButton class="w-full max-w-xs">Save request</SubmitButton>
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

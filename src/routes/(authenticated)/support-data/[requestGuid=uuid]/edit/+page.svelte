<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated({ form: f }) {
      if (f.valid) {
        goto(localizeHref(`/support-data/${data.request.Id}`));
      }
    }
  });
</script>

<div class="relative mx-auto w-full max-w-6xl p-4">
  <h1 class="p-0">{m.supportData_editTitle()}</h1>
  <p class="font-mono text-sm opacity-70">{data.request.Id}</p>

  <form method="POST" use:enhance class="maingrid mt-4 grid w-full">
    <!-- Editable fields -->
    <div class="mainarea card min-w-0 overflow-hidden rounded-md border border-slate-400">
      <div class="bg-neutral">
        <h2>{m.supportData_requestDetails()}</h2>
      </div>
      <div class="flex flex-col gap-2 p-4">
        <LabeledFormInput
          key="supportData_requestName"
          input={{
            name: 'name',
            err: m.formErrors_nameEmpty(),
            icon: Icons.Name,
            required: true,
            maxlength: 200,
            placeholder: m.supportData_namePlaceholder()
          }}
          bind:value={$form.name}
        />
        <LabeledFormInput
          key="supportData_ticketUrl"
          input={{
            name: 'ticketUrl',
            type: 'url',
            err: m.supportData_ticketUrlInvalid(),
            icon: Icons.URL,
            placeholder: 'https://support.example.com/tickets/123'
          }}
          bind:value={$form.ticketUrl}
        />
        <LabeledFormInput key="common_description">
          <textarea
            class="textarea h-48 w-full"
            name="description"
            maxlength="5000"
            placeholder={m.supportData_descriptionPlaceholder()}
            bind:value={$form.description}
          ></textarea>
        </LabeledFormInput>
      </div>
    </div>

    <!-- Read-only info, styled like the project page's Organization/Owner card -->
    <div class="sidebararea card h-fit min-w-0 rounded-md border border-slate-400 bg-neutral">
      <div class="flex flex-col py-4">
        <div class="flex flex-col px-4">
          <span class="flex items-center gap-x-1">
            <IconContainer icon={Icons.Organization} width={20} />
            {m.project_org()}
          </span>
          <span class="text-right">{data.request.Organization.Name}</span>
        </div>
        <div class="divider my-2"></div>
        <div class="flex flex-col px-4">
          <span class="flex items-center gap-x-1">
            <IconContainer icon={Icons.User} width={20} />
            {m.supportData_agent()}
          </span>
          <span class="text-right">
            {data.request.Agent?.Name ??
              data.request.Agent?.Email ??
              m.supportData_userFallback({ id: data.request.AgentId })}
          </span>
        </div>
        <div class="divider my-2"></div>
        <div class="flex flex-col px-4">
          <span class="flex items-center gap-x-1">
            <IconContainer icon={Icons.DateRange} width={20} />
            {m.supportData_dateUploaded()}
          </span>
          <span class="text-right">{getTimeDateString(data.request.DateUploaded)}</span>
        </div>
      </div>
    </div>

    <div class="actionsarea flex flex-row flex-wrap place-content-center gap-4 p-4">
      <CancelButton
        returnTo={localizeHref(`/support-data/${data.request.Id}`)}
        class="w-full max-w-xs"
      />
      <SubmitButton class="w-full max-w-xs" />
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

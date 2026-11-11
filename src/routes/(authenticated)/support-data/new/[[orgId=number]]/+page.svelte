<script lang="ts">
  import { type FormResult, superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { RoleId } from '$lib/prisma';
  import { orgActive } from '$lib/stores';
  import { notBlankRegex, ticketUrlRegex } from '$lib/supportData';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { hasRoleForOrg, isAdminForOrg } from '$lib/utils/roles';
  import { regExpToInputPattern } from '$lib/valibot';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdate({ form: f, result }) {
      const createdId =
        result.type === 'success'
          ? (result.data as FormResult<{ createdId: string }>).createdId
          : undefined;
      if (f.valid && createdId) {
        goto(localizeHref(`/support-data/${createdId}`));
      }
    }
  });

  $effect(() => {
    const roles = data.session.user.roles;
    const hasAccess =
      !!$orgActive &&
      (isAdminForOrg($orgActive, roles) || hasRoleForOrg($orgActive, RoleId.SupportAgent, roles));
    if (!selectGotoFromOrg(hasAccess, `/support-data/new/${$orgActive}`, `/support-data/new`)) {
      setOrgFromParams($orgActive, page.params.orgId);
    }
  });
</script>

<div class="relative mx-auto w-full max-w-6xl p-4">
  <h1 class="p-0">{m.supportData_newTitle()}</h1>

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
            pattern: regExpToInputPattern(notBlankRegex),
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
            pattern: regExpToInputPattern(ticketUrlRegex),
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

    <!-- Organization, styled like the project page's Organization/Owner card -->
    <div class="sidebararea card h-fit min-w-0 rounded-md border border-slate-400 bg-neutral">
      <LabeledFormInput key="project_org" class="p-4">
        <select
          class="select w-full"
          name="organizationId"
          required
          bind:value={$form.organizationId}
        >
          <option value={0}>{m.supportData_selectOrganization()}</option>
          {#each data.organizations as organization}
            <option value={organization.Id}>{organization.Name}</option>
          {/each}
        </select>
      </LabeledFormInput>
    </div>

    <div class="actionsarea flex flex-row flex-wrap place-content-center gap-4 p-4">
      <CancelButton
        returnTo={localizeHref(data.orgId ? `/support-data/${data.orgId}` : '/support-data')}
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

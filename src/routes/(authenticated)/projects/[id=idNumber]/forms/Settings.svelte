<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { ActionData } from '../$types';
  import { enhance } from '$app/forms';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import PublicPrivateToggle from '$lib/components/settings/PublicPrivateToggle.svelte';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';

  interface Props {
    project: Prisma.ProjectsGetPayload<{
      select: {
        IsPublic: true;
        AllowDownloads: true;
      };
    }>;
    publicEndpoint: string;
    downloadEndpoint: string;
    canEdit: boolean;
  }

  let { project, publicEndpoint, downloadEndpoint, canEdit }: Props = $props();

  let isPublic = $state(!!project.IsPublic);
  let publicForm: HTMLFormElement;
  let downloadInput: HTMLInputElement;
</script>

<h2 class="pl-0 pt-0">{m.project_settings_title()}</h2>
<div class="space-y-2">
  <form
    bind:this={publicForm}
    method="POST"
    action="?/{publicEndpoint}"
    use:enhance={() =>
      ({ update, result }) => {
        if (result.type === 'success') {
          const res = result.data as ActionData;
          if (res?.ok) {
            if (isPublic) {
              toast('success', m.project_acts_isPublic_on());
            } else {
              toast('success', m.project_acts_isPublic_off());
            }
          } else {
            toast('error', m.errors_generic({ errorMessage: '' }));
            isPublic = !isPublic;
          }
        }
        update({ reset: false });
      }}
  >
    <PublicPrivateToggle
      title={{ key: 'project_visibility_title' }}
      message={{ key: 'project_visibility_description' }}
      formName="isPublic"
      bind:checked={isPublic}
      inputAttr={{
        onchange: () => {
          publicForm.requestSubmit();
        },
        disabled: !canEdit
      }}
      className={canEdit ? '' : 'cursor-not-allowed'}
    />
  </form>
  <form
    method="POST"
    action="?/{downloadEndpoint}"
    use:enhance={() =>
      ({ update, result }) => {
        if (result.type === 'success') {
          const res = result.data as ActionData;
          if (res?.ok) {
            if (downloadInput.checked) {
              toast('success', m.project_acts_downloads_on());
            } else {
              toast('success', m.project_acts_downloads_off());
            }
          } else {
            toast('error', m.errors_generic({ errorMessage: '' }));
            downloadInput.checked = !downloadInput.checked;
          }
        }
        update({ reset: false });
      }}
  >
    <InputWithMessage
      title={{ key: 'project_orgDownloads_title' }}
      message={{ key: 'project_orgDownloads_description' }}
      className={canEdit ? '' : 'cursor-not-allowed'}
    >
      <input
        bind:this={downloadInput}
        type="checkbox"
        name="allowDownloads"
        class="toggle toggle-accent ml-4"
        checked={project.AllowDownloads}
        onchange={() => {
          downloadInput.form?.requestSubmit();
        }}
        disabled={!canEdit}
      />
    </InputWithMessage>
  </form>
</div>

<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { ActionData } from '../$types';
  import { enhance } from '$app/forms';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
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
  let allowDownloads = $state(!!project.AllowDownloads);
  let downloadForm: HTMLFormElement;
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
    <Toggle
      title={{ key: 'project_visibility_title' }}
      message={{ key: 'project_visibility_description' }}
      name="isPublic"
      bind:checked={isPublic}
      onchange={() => {
        publicForm.requestSubmit();
      }}
      onIcon="mdi:lock-open-variant"
      offIcon="mdi:lock"
    />
  </form>
  <form
    method="POST"
    action="?/{downloadEndpoint}"
    bind:this={downloadForm}
    use:enhance={() =>
      ({ update, result }) => {
        if (result.type === 'success') {
          const res = result.data as ActionData;
          if (res?.ok) {
            if (allowDownloads) {
              toast('success', m.project_acts_downloads_on());
            } else {
              toast('success', m.project_acts_downloads_off());
            }
          } else {
            toast('error', m.errors_generic({ errorMessage: '' }));
            allowDownloads = !allowDownloads;
          }
        }
        update({ reset: false });
      }}
  >
    <Toggle
      title={{ key: 'project_orgDownloads_title' }}
      name="canDownload"
      message={{ key: 'project_orgDownloads_description' }}
      bind:checked={allowDownloads}
      onchange={() => {
        downloadForm.requestSubmit();
      }}
    />
  </form>
</div>

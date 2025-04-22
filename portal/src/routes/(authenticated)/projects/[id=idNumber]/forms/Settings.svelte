<script lang="ts">
  import { enhance } from '$app/forms';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import PublicPrivateToggle from '$lib/components/settings/PublicPrivateToggle.svelte';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';
  import type { ActionData } from '../$types';

  interface Props {
    project: {
      IsPublic: boolean | null;
      AllowDownloads: boolean | null;
    };
  }

  let { project }: Props = $props();
</script>

<h2 class="pl-0 pt-0">{m.project_settings_title()}</h2>
<div class="space-y-2">
  <form
    method="POST"
    action="?/toggleVisibility"
    use:enhance={() =>
      ({ update, result }) => {
        if (result.type === 'success') {
          const res = result.data as ActionData;
          const publicInput = document.querySelector('[name=isPublic]') as HTMLInputElement;
          if (res?.ok) {
            if (publicInput.checked) {
              toast('success', m.project_operations_isPublic_on());
            } else {
              toast('success', m.project_operations_isPublic_off());
            }
          } else {
            toast('error', m.errors_generic({ errorMessage: '' }));
            publicInput.checked = !publicInput.checked;
          }
        }
        update({ reset: false });
      }}
  >
    <PublicPrivateToggle
      title={{ key: 'project_settings_visibility_title' }}
      message={{ key: 'project_settings_visibility_description' }}
      formName="isPublic"
      bind:checked={project.IsPublic!}
      onchange={() => {
        const publicInput = document.querySelector('[name=isPublic]') as HTMLInputElement;
        publicInput.form?.requestSubmit();
      }}
    />
  </form>
  <form
    method="POST"
    action="?/toggleDownload"
    use:enhance={() =>
      ({ update, result }) => {
        if (result.type === 'success') {
          const res = result.data as ActionData;
          const downloadInput = document.querySelector('[name=allowDownload]') as HTMLInputElement;
          if (res?.ok) {
            if (downloadInput.checked) {
              toast('success', m.project_operations_allowDownloads_on());
            } else {
              toast('success', m.project_operations_allowDownloads_off());
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
      title={{ key: 'project_settings_organizationDownloads_title' }}
      message={{ key: 'project_settings_organizationDownloads_description' }}
    >
      <input
        type="checkbox"
        name="allowDownload"
        class="toggle toggle-accent ml-4"
        checked={project.AllowDownloads}
        onchange={(e) => {
          (e.currentTarget.parentElement?.parentElement as HTMLFormElement).requestSubmit();
        }}
      />
    </InputWithMessage>
  </form>
</div>

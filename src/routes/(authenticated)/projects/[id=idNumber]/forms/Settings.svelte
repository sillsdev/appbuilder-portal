<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { ActionData } from '../$types';
  import { enhance } from '$app/forms';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import ToggleForm from '$lib/components/settings/ToggleForm.svelte';
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
  <ToggleForm
    name="isPublic"
    method="POST"
    action="?/{publicEndpoint}"
    formVar={isPublic}
    onmsg={m.project_acts_isPublic_on()}
    offmsg={m.project_acts_isPublic_off()}
    title={{ key: 'project_visibility_title' }}
    message={{ key: 'project_visibility_description' }}
    onIcon="mdi:lock-open-variant"
    offIcon="mdi:lock"
  />

  <ToggleForm
    name="allowDownloads"
    method="POST"
    action="?/{downloadEndpoint}"
    title={{ key: 'project_orgDownloads_title' }}
    message={{ key: 'project_orgDownloads_description' }}
    onmsg={m.project_acts_downloads_on()}
    offmsg={m.project_acts_downloads_off()}
    formVar={allowDownloads}
  />
</div>

<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import ToggleForm from '$lib/components/settings/ToggleForm.svelte';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    project: Prisma.ProjectsGetPayload<{
      select: {
        IsPublic: true;
        AllowDownloads: true;
        AutoPublishOnRebuild: true;
        RebuildOnSoftwareUpdate: true;
      };
    }>;
    canEdit: boolean;
    showRebuildToggles: boolean;
  }

  let { project, canEdit, showRebuildToggles }: Props = $props();

  const publicEndpoint = 'toggleVisibility';
  const downloadEndpoint = 'toggleDownload';
  const rebuildEndpoint = 'toggleRebuildOnSoftwareUpdate';
  const publishEndpoint = 'toggleAutoPublishOnRebuild';

  let isPublic = $state(!!project.IsPublic);
  let allowDownloads = $state(!!project.AllowDownloads);
  let autoRebuild = $state(!!project.RebuildOnSoftwareUpdate);
  let autoPublish = $state(!!project.AutoPublishOnRebuild);
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
    onIcon={Icons.Visible}
    offIcon={Icons.Invisible}
    {canEdit}
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
    onIcon={Icons.Download}
    offIcon={Icons.DownloadOff}
    {canEdit}
  />

  {#if showRebuildToggles}
    <ToggleForm
      name="autoRebuildOnSoftwareUpdate"
      method="POST"
      action="?/{rebuildEndpoint}"
      title={{ key: 'project_autoRebuild_on_update_title' }}
      message={{ key: 'project_autoRebuild_on_update_description' }}
      onmsg={m.project_acts_autoBuilds_on()}
      offmsg={m.project_acts_autoBuilds_off()}
      formVar={autoRebuild}
      onIcon={Icons.UpdateOn}
      offIcon={Icons.UpdateOff}
      {canEdit}
    />

    <ToggleForm
      name="autoPublishOnRebuild"
      method="POST"
      action="?/{publishEndpoint}"
      title={{ key: 'project_autoPublish_title' }}
      message={{ key: 'project_autoPublish_description' }}
      onmsg={m.project_acts_autoPublish_on()}
      offmsg={m.project_acts_autoPublish_off()}
      formVar={autoPublish}
      onIcon={Icons.RefreshOn}
      offIcon={Icons.RefreshOff}
      {canEdit}
    />
  {/if}
</div>

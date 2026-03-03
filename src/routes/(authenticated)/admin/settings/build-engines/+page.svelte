<script lang="ts">
  import type { PageData } from './$types';
  import { QueueName } from '$lib/bullmq';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { Icons, getAppIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName, byString } from '$lib/utils/sorting';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const buildEngines = $derived(
    data.buildEngines.toSorted((a, b) => byString(a.BuildEngineUrl, b.BuildEngineUrl, getLocale()))
  );
  let dates = $derived(getRelativeTime(buildEngines.map((engine) => engine.DateUpdated)));
</script>

<h2>{m.buildEngines_title()}</h2>

<div class="flex flex-col w-full">
  {#if buildEngines.length === 0}
    <i>
      No build engine information. Check the <a
        class="link"
        target="_blank"
        href="/admin/jobs/queue/{encodeURIComponent(QueueName.System_Recurring)}"
      >
        "Check System Statuses" recurring BullMQ job
      </a>
    </i>
  {/if}
  {#each buildEngines as buildEngine, i}
    <div class="flex flex-col border border-slate-600 p-2 mx-4 m-1 rounded-md">
      <h3 class="flex flex-col-reverse md:flex-row gap-2">
        <div>
          <span class="badge badge-error" class:badge-success={buildEngine.SystemAvailable}>
            {buildEngine.SystemAvailable
              ? m.buildEngines_connected()
              : m.buildEngines_disconnected()}
          </span>
          {#if !buildEngine.Organization}
            <span class="badge badge-info">
              {m.common_default()}
            </span>
          {/if}
        </div>
        <a href={buildEngine.BuildEngineUrl} class="link" target="_blank">
          {buildEngine?.BuildEngineUrl}
          <IconContainer icon={Icons.Open} width={16} />
        </a>
      </h3>
      <div>
        <IconContainer icon={Icons.RefreshOn} width={16} tooltip={m.buildEngines_lastUpdated()} />
        <Tooltip class="indent-0" tip={getTimeDateString(buildEngine.DateUpdated ?? null)}>
          {buildEngine ? $dates[i] : '-'}
        </Tooltip>
      </div>
      <div>
        <IconContainer icon={Icons.Key} width={16} tooltip={m.buildEngines_accessToken()} />
        {buildEngine.BuildEngineApiAccessToken}
      </div>
      <div>
        <IconContainer icon={Icons.Organization} width={16} />
        {buildEngine.Organization?.Name ?? data.defaultUsers}
      </div>
      <b>{m.projectTable_appBuilderVersion()}:</b>
      <ul>
        {#each buildEngine.SystemVersions.map( (v) => ({ ...v, Name: data.applications.get(v.ApplicationTypeId) }) ).toSorted( (a, b) => byName(a, b, getLocale()) ) as version}
          <li class="flex flex-row gap-1 indent-0 mt-1">
            <img src={getAppIcon(version.ApplicationTypeId)} width={24} alt="" />
            <Tooltip tip={version.ImageHash}>
              {version.Name}: {version.Version} ({version.DateUpdated?.toLocaleDateString()})
            </Tooltip>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>

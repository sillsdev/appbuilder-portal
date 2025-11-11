<script lang="ts">
  import type { PageData } from './$types';
  import { QueueName } from '$lib/bullmq';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
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

  const applications = $derived(new Map(data.applications.map((a) => [a.Id, a])));
</script>

{#snippet date(engine?: (typeof buildEngines)[0] & { i: number })}
  <Tooltip class="indent-0" tip={getTimeDateString(engine?.DateUpdated ?? null)}>
    {engine ? $dates[engine.i] : '-'}
  </Tooltip>
{/snippet}

{#snippet versions(engine?: (typeof buildEngines)[0])}
  <ul>
    {#each data.versions
      .filter((v) => v.BuildEngineUrl === engine?.BuildEngineUrl)
      .map((v) => ({ ...v, Name: applications.get(v.ApplicationTypeId)?.Description }))
      .toSorted((a, b) => byName(a, b, getLocale())) as version}
      <li>{version.Name}: {version.Version} ({version.DateUpdated?.toLocaleDateString()})</li>
    {/each}
  </ul>
{/snippet}

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
  {#each buildEngines.toSorted( (a, b) => byString(a.BuildEngineUrl, b.BuildEngineUrl, getLocale()) ) as buildEngine, i}
    <DataDisplayBox
      title={buildEngine.BuildEngineUrl}
      data={{ ...buildEngine, i }}
      fields={[
        {
          key: 'buildEngines_accessToken',
          value: buildEngine.BuildEngineApiAccessToken
        },
        {
          key: 'buildEngines_status',
          value: buildEngine.SystemAvailable
            ? m.buildEngines_connected()
            : m.buildEngines_disconnected()
        },
        { key: 'buildEngines_lastUpdated', snippet: date },
        { key: 'projectTable_appBuilderVersion', snippet: versions }
      ]}
    />
  {/each}
</div>

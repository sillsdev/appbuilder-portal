<script lang="ts">
  import type { PageData } from './$types';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byString } from '$lib/utils/sorting';
  import { getRelativeTime } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let dates = $derived(getRelativeTime(data.buildEngines.map((engine) => engine.DateUpdated)));
  let locale = getLocale();
</script>

{#snippet date(engine?: (typeof data.buildEngines)[0] & { i: number })}
  <Tooltip className="indent-0" tip={engine?.DateUpdated?.toLocaleString(locale)}>
    {engine ? $dates[engine.i] : '-'}
  </Tooltip>
{/snippet}

<div class="flex flex-col w-full">
  {#if data.buildEngines.length === 0}
    <i>No build engine information. Check the "Check System Statuses" recurring BullMQ job</i>
  {/if}
  {#each data.buildEngines.toSorted( (a, b) => byString(a.BuildEngineUrl, b.BuildEngineUrl, getLocale()) ) as buildEngine, i}
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
        { key: 'buildEngines_lastUpdated', snippet: date }
      ]}
    />
  {/each}
</div>

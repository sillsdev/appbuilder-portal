<script lang="ts">
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byString } from '$lib/utils/sorting';
  import { getRelativeTime } from '$lib/utils/time';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let locale = getLocale();
</script>

{#snippet date(engine?: (typeof data.buildEngines)[0])}
  <Tooltip className="indent-0" tip={engine?.DateUpdated?.toLocaleString(locale)}>
    {engine?.DateUpdated ? getRelativeTime(engine.DateUpdated) : '-'}
  </Tooltip>
{/snippet}

<div class="flex flex-col w-full">
  {#each data.buildEngines.toSorted( (a, b) => byString(a.BuildEngineUrl, b.BuildEngineUrl, getLocale()) ) as buildEngine}
    <DataDisplayBox
      title={buildEngine.BuildEngineUrl}
      data={buildEngine}
      fields={[
        {
          key: 'admin_settings_buildEngines_accessToken',
          value: buildEngine.BuildEngineApiAccessToken
        },
        {
          key: 'admin_settings_buildEngines_status',
          value: buildEngine.SystemAvailable
            ? m.admin_settings_buildEngines_connected()
            : m.admin_settings_buildEngines_disconnected()
        },
        { key: 'admin_settings_buildEngines_lastUpdated', snippet: date }
      ]}
    />
  {/each}
</div>

<script lang="ts">
  import { _, locale } from 'svelte-i18n';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { getRelativeTime } from '$lib/relativeTime';

  export let data: PageData;
</script>

<div class="flex flex-col w-full">
  {#each data.buildEngines as buildEngine}
    <DataDisplayBox
      title={buildEngine.BuildEngineUrl}
      fields={[
        {
          key: 'admin.settings.buildEngines.accessToken',
          value: buildEngine.BuildEngineApiAccessToken
        },
        {
          key: 'admin.settings.buildEngines.status',
          value: $_(
            'admin.settings.buildEngines.' +
              (buildEngine.SystemAvailable ? 'connected' : 'disconnected')
          )
        },
        {
          key: 'admin.settings.buildEngines.lastUpdated',
          value: buildEngine.DateUpdated ? getRelativeTime(buildEngine.DateUpdated) : 'null'
        }
      ]}
    />
  {/each}
</div>

<script lang="ts">
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import * as m from '$lib/paraglide/messages';
  import { getRelativeTime } from '$lib/timeUtils';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="flex flex-col w-full">
  {#each data.buildEngines as buildEngine}
    <DataDisplayBox
      title={buildEngine.BuildEngineUrl}
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
        {
          key: 'admin_settings_buildEngines_lastUpdated',
          // TODO: tooltip will need to wait until Svelte 5
          value: buildEngine.DateUpdated ? getRelativeTime(buildEngine.DateUpdated) : 'null'
        }
      ]}
    />
  {/each}
</div>

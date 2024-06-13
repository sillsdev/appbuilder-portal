<script lang="ts">
  import { _, locale } from 'svelte-i18n';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';

  export let data: PageData;
  let relativeTimeFormatter = new Intl.RelativeTimeFormat($locale!);
  locale.subscribe((value) => {
    relativeTimeFormatter = new Intl.RelativeTimeFormat(value!);
  });
  function getRelativeTime(date: Date) {
    // in miliseconds
    const units = {
      year: 24 * 60 * 60 * 1000 * 365,
      month: (24 * 60 * 60 * 1000 * 365) / 12,
      day: 24 * 60 * 60 * 1000,
      hour: 60 * 60 * 1000,
      minute: 60 * 1000,
      second: 1000
    } as const;

    const elapsed = date.valueOf() - new Date().valueOf();
    for (const u in units) {
      if (Math.abs(elapsed) > units[u as keyof typeof units] || u == 'second')
        return relativeTimeFormatter.format(
          Math.round(elapsed / units[u as keyof typeof units]),
          u as keyof typeof units
        );
    }
  }
</script>

<h2>{$_('admin.settings.buildEngines.title')}</h2>

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

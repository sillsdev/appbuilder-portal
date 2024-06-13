<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';

  export let data: PageData;
</script>

<h2>{$_('admin.settings.storeTypes.title')}</h2>

<div class="btn btn-outline rounded-none m-4 mt-0">
  {$_('admin.settings.storeTypes.add')}
</div>

<div class="flex flex-col w-full">
  {#each data.storeTypes as storeType}
    <DataDisplayBox
      title={storeType.Name}
      fields={[{ key: 'stores.attributes.description', value: storeType.Description }]}
    />
  {/each}
</div>

<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';

  export let data: PageData;
</script>

<h2>{$_('admin.settings.navigation.stores')}</h2>

<div class="btn btn-outline rounded-none m-4 mt-0">
  {$_('models.add', { values: { name: $_('stores.name') } })}
</div>

<div class="flex flex-col w-full">
  {#each data.stores as store}
    <DataDisplayBox
      title={store.Name}
      fields={[
        { key: 'stores.attributes.description', value: store.Description },
        { key: 'storeTypes.name', value: store.StoreType.Name }
      ]}
    />
  {/each}
</div>

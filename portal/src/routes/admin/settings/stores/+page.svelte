<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;
</script>

<div class="btn btn-outline rounded-none m-4 mt-0">
  {$_('models.add', { values: { name: $_('stores.name') } })}
</div>

<div class="flex flex-col w-full">
  {#each data.stores as store}
    <DataDisplayBox
      editable
      on:edit={() => goto('/admin/settings/stores/edit?id=' + store.Id)}
      title={store.Name}
      fields={[
        { key: 'stores.attributes.description', value: store.Description },
        { key: 'storeTypes.name', value: store.StoreType.Name }
      ]}
    />
  {/each}
</div>

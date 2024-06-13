<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;
</script>

<div class="btn btn-outline rounded-none m-4 mt-0">
  {$_('admin.settings.storeTypes.add')}
</div>

<div class="flex flex-col w-full">
  {#each data.storeTypes as storeType}
    <DataDisplayBox
      editable
      on:edit={() => goto('/admin/settings/store-types/edit?id=' + storeType.Id)}
      title={storeType.Name}
      fields={[{ key: 'stores.attributes.description', value: storeType.Description }]}
    />
  {/each}
</div>

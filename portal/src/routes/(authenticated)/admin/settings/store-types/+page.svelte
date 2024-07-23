<script lang="ts">
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<a href="store-types/new" class="btn btn-outline m-4 mt-0">
  {m.admin_settings_storeTypes_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.storeTypes as storeType}
    <DataDisplayBox
      editable
      on:edit={() => goto('/admin/settings/store-types/edit?id=' + storeType.Id)}
      title={storeType.Name}
      fields={[{ key: 'stores_attributes_description', value: storeType.Description }]}
    />
  {/each}
</div>

<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;
</script>

<a href="stores/new" class="btn btn-outline rounded-none m-4 mt-0">
  {m.models_add({ name: m.stores_name() })}
</a>

<div class="flex flex-col w-full">
  {#each data.stores as store}
    <DataDisplayBox
      editable
      on:edit={() => goto('/admin/settings/stores/edit?id=' + store.Id)}
      title={store.Name}
      fields={[
        { key: 'stores_attributes_description', value: store.Description },
        { key: 'storeTypes_name', value: store.StoreType.Name }
      ]}
    />
  {/each}
</div>

<script lang="ts">
  import { goto } from '$app/navigation';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<a href="stores/new" class="btn btn-outline m-4 mt-0">
  {m.models_add({ name: m.stores_name() })}
</a>

<div class="flex flex-col w-full">
  {#each data.stores.sort((a, b) => byName(a, b, languageTag())) as store}
    <DataDisplayBox
      editable
      onEdit={() => goto('/admin/settings/stores/edit?id=' + store.Id)}
      title={store.Name}
      fields={[
        { key: 'stores_attributes_description', value: store.Description },
        { key: 'storeTypes_name', value: store.StoreType.Name }
      ]}
    />
  {/each}
</div>

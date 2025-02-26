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

<a href="store-types/new" class="btn btn-outline m-4 mt-0">
  {m.admin_settings_storeTypes_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.storeTypes.sort((a, b) => byName(a, b, languageTag())) as storeType}
    <DataDisplayBox
      editable
      onEdit={() => goto('/admin/settings/store-types/edit?id=' + storeType.Id)}
      title={storeType.Name}
      fields={[{ key: 'stores_attributes_description', value: storeType.Description }]}
    />
  {/each}
</div>

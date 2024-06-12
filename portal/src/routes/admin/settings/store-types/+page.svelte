<script lang="ts">
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import InternationalizedDataBox from '$lib/components/InternationalizedDataBox.svelte';

  export let data: PageData;
</script>

<div class="flex grow flex-col">
  <h2>{$_('admin.settings.storeTypes.title')}</h2>

  <div class="btn btn-outline rounded-none m-4 mt-0">
    {$_('admin.settings.storeTypes.add')}
  </div>

  <div class="flex flex-col w-full">
    {#each data.storeTypes as storeType}
      <InternationalizedDataBox
        title={storeType.Name}
        fields={[{ key: 'stores.attributes.description', value: storeType.Description }]}
      />
    {/each}
  </div>
</div>

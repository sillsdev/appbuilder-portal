<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { getStoreIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/store-types';
</script>

<h2>{m.storeTypes_title()}</h2>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  {m.storeTypes_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.storeTypes.toSorted((a, b) => byName(a, b, getLocale())) as storeType}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${storeType.Id}`))}
      fields={[{ key: 'common_description', value: storeType.Description }]}
    >
      {#snippet title()}
        <h3>
          <IconContainer
            icon={getStoreIcon(storeType.Id)}
            width={20}
            class="mr-1"
          />{storeType.Name}
        </h3>
      {/snippet}
    </DataDisplayBox>
  {/each}
</div>

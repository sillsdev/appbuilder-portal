<script
  lang="ts"
  generics="Store extends Prisma.StoresGetPayload<{
    include: { StoreType: true; Owner: { select: { Name: true } } };
  }>"
>
  import type { Prisma } from '@prisma/client';
  import type { Snippet } from 'svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { Icons, getStoreIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { StoreType, displayStoreGPTitle } from '$lib/prisma';

  interface Props {
    editable: boolean;
    editLink?: string;
    store: Store;
    getTitle: (store: Store) => string;
    extra?: Snippet<[Store]>;
    showDescription?: boolean;
  }

  let { editable, editLink, store, getTitle, extra, showDescription }: Props = $props();

  const missingGPTitle = $derived(
    store.StoreTypeId === StoreType.GooglePlay && editable && !store.GooglePlayTitle
  );
</script>

{#snippet gpTitleError()}
  <Tooltip tip={m.stores_gpTitleEmpty()} class="indent-0">
    <IconContainer icon={Icons.InfoOutline} width={18} />
  </Tooltip>
{/snippet}

<DataDisplayBox
  {editable}
  {editLink}
  fields={[
    { key: 'projectTable_owner', value: store.Owner?.Name ?? m.appName() },
    ...(showDescription
      ? [{ key: 'common_description' as ValidI13nKey, value: store.Description }]
      : []),
    { key: 'stores_publisherId', value: store.BuildEnginePublisherId },
    { key: 'common_type', value: store.StoreType.Description },
    ...(displayStoreGPTitle(store) || missingGPTitle
      ? [
          {
            key: 'stores_gpTitle' as ValidI13nKey,
            value: store.GooglePlayTitle,
            class: { 'text-error': missingGPTitle },
            snippet: missingGPTitle ? gpTitleError : undefined
          }
        ]
      : [])
  ]}
>
  {@render extra?.(store)}
  {#snippet title()}
    <h3>
      <IconContainer icon={getStoreIcon(store.StoreTypeId)} width={20} class="mr-1" />{getTitle(
        store
      )}
    </h3>
  {/snippet}
</DataDisplayBox>

<script
  lang="ts"
  generics="Store extends Prisma.StoresGetPayload<{
    include: { StoreType: true; Owner: { select: { Name: true } } };
  }>"
>
  import type { Prisma } from '@prisma/client';
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { Icons, getStoreIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { StoreType, displayStoreGPTitle } from '$lib/prisma';
  import { isSuperAdmin } from '$lib/utils/roles';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    editable: boolean;
    editLink?: string;
    store: Store;
    getTitle: (store: Store) => string;
    extra?: Snippet<[Store]>;
    showDescription?: boolean;
    users?: (Prisma.OrganizationsGetPayload<{ select: { Name: true } }> & { Products: number })[];
  }

  let { editable, editLink, store, getTitle, extra, showDescription, users }: Props = $props();

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
      : []),
    ...(users?.length && isSuperAdmin(page.data.session!.user.roles)
      ? [
          {
            key: 'org_title' as ValidI13nKey,
            value: users
              .toSorted((a, b) => byName(a, b, getLocale()))
              .map((u) => `${u.Name} (${u.Products})`)
              .join(', ')
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

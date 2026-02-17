<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import { Icons, getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { displayStoreGPTitle } from '$lib/prisma';
  import { toast } from '$lib/utils';
  import { byName, byString } from '$lib/utils/sorting';

  interface Props {
    modal?: HTMLDialogElement;
    prodDefs: Prisma.ProductDefinitionsGetPayload<{
      select: {
        Id: true;
        Name: true;
        Description: true;
        Workflow: {
          select: {
            ProductType: true;
            StoreTypeId: true;
          };
        };
      };
    }>[];
    stores: Prisma.StoresGetPayload<{
      select: {
        Id: true;
        BuildEnginePublisherId: true;
        GooglePlayTitle: true;
        Description: true;
        StoreTypeId: true;
      };
    }>[];
    endpoint: string;
  }

  let { modal = $bindable(), prodDefs, stores, endpoint }: Props = $props();

  let selectingStore = $state(false);
  let selectedProduct: Props['prodDefs'][0] | undefined = $state(prodDefs[0]);
  let availableStores = $derived(
    stores.filter((s) => s.StoreTypeId === selectedProduct?.Workflow.StoreTypeId)
  );
</script>

<dialog bind:this={modal} class="modal">
  <form
    class="modal-box max-w-3xl"
    action="?/{endpoint}"
    method="POST"
    use:enhance={() =>
      ({ update, result }) => {
        if (result.type === 'error') {
          if (result.status === 503) {
            toast('error', m.system_unavailable());
          }
        }
        update({ reset: false });
      }}
  >
    {#if page.data.jobsAvailable}
      <div class="items-center text-center" class:hidden={selectingStore}>
        <div class="flex flex-row">
          <h2 class="text-lg font-bold grow pt-2 ml-[68px]">{m.products_addTitle()}</h2>
          <button
            class="btn btn-ghost"
            type="button"
            onclick={() => {
              modal?.close();
            }}
          >
            <IconContainer icon={Icons.Close} width={36} class="opacity-80" />
          </button>
        </div>
        <div class="flex flex-col pt-1 space-y-1">
          {#each prodDefs.toSorted((a, b) => byName(a, b, getLocale())) as productDef}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <label
              class="flex flex-col border border-secondary rounded-sm text-left cursor-pointer"
              onclick={() => {
                selectingStore = true;
                selectedProduct = productDef;
              }}
            >
              <div class="flex flex-row bg-neutral-300 p-2 w-full text-black">
                <IconContainer icon={getProductIcon(productDef.Workflow.ProductType)} width={24} />
                {productDef.Name}
              </div>
              <p class="p-2 text-sm text-neutral-400">{productDef.Description}</p>
              <input type="radio" name="productDefinitionId" value={productDef.Id} class="hidden" />
            </label>
          {/each}
        </div>
      </div>
      <div class="items-center text-center" class:hidden={!selectingStore}>
        <div class="flex flex-row">
          <button
            class="btn btn-ghost"
            type="button"
            onclick={() => {
              selectingStore = false;
            }}
          >
            <IconContainer icon={Icons.Back} width={36} class="opacity-80" />
          </button>
          <h2 class="text-lg grow font-bold pt-2">
            {m.products_storeSelect({
              name: selectedProduct?.Name || ''
            })}
          </h2>
          <button
            class="btn btn-ghost"
            type="button"
            onclick={() => {
              modal?.close();
              setTimeout(() => (selectingStore = false), 300);
            }}
          >
            <IconContainer icon={Icons.Close} width={36} class="opacity-80" />
          </button>
        </div>
        <div class="flex flex-col pt-1 space-y-1">
          {#if availableStores.length}
            {@const locale = getLocale()}
            {@const display = (store: (typeof availableStores)[number]) =>
              // prefer store description, if null, display GP title, if still empty, show publisher id as last resort
              store.Description || displayStoreGPTitle(store) || store.BuildEnginePublisherId}
            {#each availableStores.toSorted( (a, b) => byString(display(a), display(b), locale) ) as store}
              <label
                class="flex flex-col border border-secondary rounded-sm text-left cursor-pointer"
              >
                <div class="flex flex-row bg-neutral-300 p-2 w-full text-black">
                  {display(store)}
                </div>
                {#if displayStoreGPTitle(store)}
                  <p class="p-2 pb-0 text-sm text-neutral-400">
                    <b>{m.stores_gpTitle()}:</b>
                    <span>{store.GooglePlayTitle}</span>
                  </p>
                {/if}
                <p class="p-2 text-sm text-neutral-400">
                  <b>{m.stores_publisherId()}:</b>
                  <span>{store.BuildEnginePublisherId}</span>
                </p>
                <input
                  type="submit"
                  name="storeId"
                  value={store.Id}
                  class="hidden"
                  onclick={() => {
                    modal?.close();
                    selectingStore = false;
                  }}
                />
              </label>
            {/each}
          {:else}
            {m.products_noStoresAvailable()}
          {/if}
        </div>
      </div>
    {:else}
      {m.system_unavailable()}
    {/if}
  </form>
  <form method="dialog" class="modal-backdrop">
    <button onclick={() => (selectingStore = false)}>{m.common_close()}</button>
  </form>
</dialog>

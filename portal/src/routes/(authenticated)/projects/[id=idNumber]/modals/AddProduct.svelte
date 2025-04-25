<script lang="ts">
  import { enhance } from '$app/forms';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import type { Prisma } from '@prisma/client';

  interface Props {
    modal?: HTMLDialogElement;
    prodDefs: Prisma.ProductDefinitionsGetPayload<{
      select: {
        Id: true;
        Name: true;
        Description: true;
        Workflow: {
          select: {
            StoreTypeId: true;
          };
        };
      };
    }>[];
    stores: Prisma.StoresGetPayload<{
      select: {
        Id: true;
        Name: true;
        Description: true;
        StoreTypeId: true;
      };
    }>[];
  }

  let { modal = $bindable(), prodDefs, stores }: Props = $props();

  let selectingStore = $state(false);
  let selectedProduct = $state(prodDefs[0]);
  let availableStores = $derived(
    stores.filter((s) => s.StoreTypeId === selectedProduct.Workflow.StoreTypeId)
  );
</script>

<dialog bind:this={modal} class="modal">
  <form class="modal-box" action="?/addProduct" method="POST" use:enhance>
    <div class="items-center text-center" class:hidden={selectingStore}>
      <div class="flex flex-row">
        <h2 class="text-lg font-bold grow">{m.project_products_popup_addTitle()}</h2>
        <button
          class="btn btn-ghost"
          type="button"
          onclick={() => {
            modal?.close();
          }}
        >
          <IconContainer icon="mdi:close" width={36} class="opacity-80" />
        </button>
      </div>
      <hr />
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
              <IconContainer icon={getIcon(productDef.Name ?? '')} width="24" />
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
        <h2 class="text-lg font-bold">
          {m.products_storeSelect({
            name: selectedProduct.Name || ''
          })}
        </h2>
        <button
          class="btn btn-ghost"
          type="button"
          onclick={() => {
            selectingStore = false;
          }}
        >
          <IconContainer icon="mdi:close" width={36} class="opacity-80" />
        </button>
      </div>
      <hr />
      <div class="flex flex-col pt-1 space-y-1">
        {#if availableStores.length}
          {@const locale = getLocale()}
          {#each availableStores.toSorted((a, b) => byName(a, b, locale)) as store}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <label
              class="flex flex-col border border-secondary rounded-sm text-left cursor-pointer"
            >
              <div class="flex flex-row bg-neutral-300 p-2 w-full text-black">
                {store.Name}
              </div>
              <p class="p-2 text-sm text-neutral-400">{store.Description}</p>
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
  </form>
  <form method="dialog" class="modal-backdrop">
    <button onclick={() => (selectingStore = false)}>{m.common_close()}</button>
  </form>
</dialog>

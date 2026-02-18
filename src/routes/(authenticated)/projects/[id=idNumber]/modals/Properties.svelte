<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { enhance } from '$app/forms';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import { type ComputeType, computeTypes, getComputeType, updateComputeType } from '$lib/products';

  interface Props {
    modal?: HTMLDialogElement;
    product: Prisma.ProductsGetPayload<{
      select: {
        Id: true;
        Properties: true;
      };
    }>;
    endpoint: string;
  }

  let { modal = $bindable(), product, endpoint }: Props = $props();

  let ok = $state(true);
  let value = $state(product.Properties);

  let computeType: ComputeType | null = $state(null);

  $effect(() => {
    computeType = getComputeType(value);
  });
</script>

<dialog bind:this={modal} class="modal">
  <form
    class="modal-box"
    action="?/{endpoint}"
    method="POST"
    use:enhance={() => {
      return async ({ update }) => {
        update({ reset: false });
      };
    }}
  >
    <div class="items-center text-center">
      <h2 class="text-lg font-bold grow">
        {m.products_properties_title()}
      </h2>
      <hr />
      <div class="flex flex-col gap-2 items-center w-full pt-2 text-left">
        <input type="hidden" name="productId" value={product.Id} />
        <LabeledFormInput key="products_properties_computeType" class="w-full">
          <select
            class="select w-full"
            placeholder={m.products_properties_selectComputeType()}
            onchange={(e) => {
              if (ok) {
                value = updateComputeType(value, e.currentTarget.value as ComputeType);
              }
            }}
            bind:value={computeType}
          >
            <option selected disabled hidden value={null}>
              {m.products_properties_selectComputeType()}
            </option>
            {#each computeTypes as type}
              {@const msg =
                //@ts-expect-error the typing is correct
                m['products_properties_' + type]()}
              <option value={type}>{msg}</option>
            {/each}
          </select>
        </LabeledFormInput>
        <LabeledFormInput key="products_properties_title">
          <PropertiesEditor name="properties" class="w-full" bind:value bind:ok />
        </LabeledFormInput>
        <div class="flex flex-row gap-2">
          <button
            class="btn btn-secondary"
            type="button"
            onclick={() => {
              modal?.close();
              value = product.Properties;
            }}
          >
            {m.common_cancel()}
          </button>
          <button
            class="btn btn-primary"
            type="button"
            onclick={() => {
              if (ok) {
                value = updateComputeType(value);
              }
            }}
          >
            {m.common_default()}
          </button>
          <SubmitButton
            disabled={!ok}
            onclick={() => {
              modal?.close();
            }}
          />
        </div>
      </div>
    </div>
  </form>
  <form method="dialog" class="modal-backdrop">
    <button>{m.common_close()}</button>
  </form>
</dialog>

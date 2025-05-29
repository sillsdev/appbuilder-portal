<script lang="ts">
  import { enhance } from '$app/forms';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PropertiesEditor from '$lib/components/settings/PropertiesEditor.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { Prisma } from '@prisma/client';

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

  const computeTypes = ['small', 'medium'] as const;
  type ComputeType = (typeof computeTypes)[number];

  let computeType: ComputeType | null = $state(null);

  $effect(() => {
    const parsed = JSON.parse(value || '{}');
    computeType = (parsed['environment']?.['BUILD_COMPUTE_TYPE'] as ComputeType) ?? null;
  });

  function updateComputeType(type?: ComputeType) {
    const toAdd = type
      ? { BUILD_COMPUTE_TYPE: type }
      : {
          // default value
          BUILD_COMPUTE_TYPE: 'small',
          BUILD_IMAGE_TAG: 'latest'
        };
    if (ok) {
      const parsed = JSON.parse(value || '{}');
      if (parsed['environment']) {
        parsed['environment'] = {
          ...parsed['environment'],
          ...toAdd
        };
      } else {
        parsed['environment'] = { ...toAdd };
      }
      value = JSON.stringify(parsed, null, 4);
    }
  }
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
        <LabeledFormInput name="products_properties_computeType" className="w-full">
          <select
            class="select select-bordered w-full"
            placeholder={m.products_properties_selectComputeType()}
            onchange={(e) => {
              updateComputeType(e.currentTarget.value as ComputeType);
            }}
            bind:value={computeType}
          >
            <option selected disabled hidden value={null}>
              {m.products_properties_selectComputeType()}
            </option>
            {#each computeTypes as type}
              {@const msg =
                //@ts-expect-error the typing is correct
                m['project_products_properties_' + type]()}
              <option value={type}>{msg}</option>
            {/each}
          </select>
        </LabeledFormInput>
        <LabeledFormInput name="products_properties_title">
          <PropertiesEditor name="properties" className="w-full" bind:value bind:ok />
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
              updateComputeType();
            }}
          >
            {m.common_default()}
          </button>
          <input
            class="btn btn-primary"
            type="submit"
            value={m.common_save()}
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

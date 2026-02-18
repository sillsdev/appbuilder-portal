<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import type { Prisma } from '@prisma/client';
  import { enhance } from '$app/forms';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { sanitizeInput, toast } from '$lib/utils';

  interface Props {
    modal?: HTMLDialogElement;
    product: Prisma.ProductsGetPayload<{
      select: {
        Id: true;
        DatePublished: true;
        ProductDefinition: {
          select: {
            Name: true;
          };
        };
      };
    }>;
    endpoint: string;
    project: string;
  }

  let { modal = $bindable(), product, endpoint, project }: Props = $props();

  const sentinel = m.common_delete().toLocaleLowerCase(getLocale());

  let value = $state('');
  let disabled = $derived(!!value.localeCompare(sentinel));
</script>

<dialog bind:this={modal} class="modal" onclose={() => (value = '')}>
  <form
    class="modal-box"
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
    <div class="items-center text-center">
      <h2 class="text-lg font-bold grow">
        {m.models_delete({
          name: m.tasks_product()
        })}
      </h2>
      <div class="flex flex-col gap-2 items-center w-full pt-2 text-left">
        <input type="hidden" name="productId" value={product.Id} />
        {#if product.DatePublished}
          <div class="border-2 border-error p-2 w-full rounded-md">
            {@html m.deletePrompt_warningIfPublished()}
          </div>
        {/if}
        <div class="border-2 border-warning p-2 w-full rounded-md">
          {@html m.deletePrompt_warning()}
        </div>
        <span>
          {@html m.deletePrompt_prompt({
            product: sanitizeInput(product.ProductDefinition.Name ?? m.tasks_product()),
            project
          })}
        </span>
        <label class="w-full">
          <span class="fieldset-label">
            <span>
              {@html m.deletePrompt_label({ sentinel })}
            </span>
          </span>
          <input
            type="text"
            class="input w-full my-2"
            name="deletePrompt"
            bind:value
            placeholder={sentinel}
          />
        </label>
        <div class="flex flex-row gap-2">
          <button
            class="btn btn-secondary"
            type="button"
            onclick={() => {
              modal?.close();
            }}
          >
            {m.common_cancel()}
          </button>
          <BlockIfJobsUnavailable class="btn btn-error">
            {#snippet altContent()}
              <IconContainer icon="mdi:trash" width={20} />
              {m.common_delete()}
            {/snippet}
            <SubmitButton
              {disabled}
              onclick={() => {
                modal?.close();
              }}
            >
              {@render altContent()}
            </SubmitButton>
          </BlockIfJobsUnavailable>
        </div>
      </div>
    </div>
  </form>
  <form method="dialog" class="modal-backdrop">
    <button>{m.common_close()}</button>
  </form>
</dialog>

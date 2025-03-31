<script lang="ts">
  import { enhance } from '$app/forms';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';

  interface Props {
    modal?: HTMLDialogElement;
    product: {
      Id: string;
      ProductDefinition: {
        Name: string | null;
      };
    };
    endpoint: string;
  }

  let { modal = $bindable(), product, endpoint }: Props = $props();

  const sentinel = m.common_delete().toLocaleLowerCase(getLocale());

  let value = $state('');
  let disabled = $derived(!!value.localeCompare(sentinel));
</script>

<dialog bind:this={modal} class="modal">
  <form class="modal-box" action="?/{endpoint}" method="POST" use:enhance>
    <div class="items-center text-center">
      <div class="flex flex-row">
        <h2 class="text-lg font-bold grow">
          {m.models_delete({
            name: m.tasks_product()
          })}
        </h2>
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
      <div class="flex flex-col gap-2 items-center w-full pt-2">
        <input type="hidden" name="productId" value={product.Id} />
        <div class="border-2 border-warning p-2 text-left w-full rounded-md">
          {@html m.deletePrompt_warning()}
        </div>
        <h3>
          {m.deletePrompt_prompt({ name: product.ProductDefinition.Name ?? m.tasks_product() })}
        </h3>
        <label class="w-full">
          <span class="fieldset-label">{@html m.deletePrompt_label({ sentinel })}</span>
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
          <input
            class="btn btn-error"
            type="submit"
            value={m.common_delete()}
            {disabled}
            onclick={() => {
              modal?.close();
            }}
          />
        </div>
      </div>
    </div>
  </form>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

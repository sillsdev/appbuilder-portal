<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';

  interface Props {
    modal?: HTMLDialogElement;
    product: {
      Id: string;
      DatePublished: Date | null;
      ProductDefinition: {
        Name: string | null;
      };
    };
    endpoint: string;
    project: string;
  }

  let { modal = $bindable(), product, endpoint, project }: Props = $props();

  const sentinel = m.common_delete().toLocaleLowerCase(getLocale());

  let value = $state('');
  let disabled = $derived(!!value.localeCompare(sentinel));
</script>

<dialog bind:this={modal} class="modal" onclose={() => (value = '')}>
  <form class="modal-box" action="?/{endpoint}" method="POST" use:enhance>
    <div class="items-center text-center">
      <h2 class="text-lg font-bold grow">
        {m.models_delete({
          name: m.tasks_product()
        })}
      </h2>
      <hr />
      <div class="flex flex-col gap-2 items-center w-full pt-2 text-left">
        <input type="hidden" name="productId" value={product.Id} />
        {#if true || product.DatePublished}
          <div class="border-2 border-error p-2 w-full rounded-md">
            {@html m.deletePrompt_warningIfPublished()}
          </div>
        {/if}
        <div class="border-2 border-warning p-2 w-full rounded-md">
          {@html m.deletePrompt_warning()}
        </div>
        <span>
          {@html m.deletePrompt_prompt({
            product: product.ProductDefinition.Name ?? m.tasks_product(),
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

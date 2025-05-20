<script lang="ts" module>
  /** Shows details modal for product with productId */
  export function showProductDetails(productId: string) {
    // optional chaining for if element isn't found or isn't actually a Dialog Element
    (document.getElementById('modal' + productId) as HTMLDialogElement)?.showModal?.();
  }
</script>

<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getTimeDateString } from '$lib/utils/time';
  import type { Prisma } from '@prisma/client';
  import { ProductTransitionType } from 'sil.appbuilder.portal.common/prisma';

  interface Props {
    product: Prisma.ProductsGetPayload<{
      select: {
        Id: true;
        Store: { select: { Description: true } };
      };
    }>;
    transitions: Prisma.ProductTransitionsGetPayload<{
      select: {
        TransitionType: true;
        InitialState: true;
        WorkflowType: true;
        AllowedUserNames: true;
        Command: true;
        Comment: true;
        DateTransition: true;
        User: { select: { Name: true } };
      };
    }>[];
  }

  let { product, transitions }: Props = $props();

  const landmarks = [2, 3, 4, 6] as const;
  type Landmark = typeof landmarks[number];
  function isLandmark(t: number): t is Landmark {
    return landmarks.includes(t as Landmark);
  }

  function stateString(workflowTypeNum: number, transitionType: number) {
    if (isLandmark(transitionType)) {
      return m.transitions_types({
        type: transitionType,
        workflowType: m.flowDefs_types({ type: workflowTypeNum })
      });
    }
    return '';
  }

  let detailsModal: HTMLDialogElement;
</script>

<dialog bind:this={detailsModal} id="modal{product.Id}" class="modal">
  <div class="modal-box w-11/12 max-w-6xl">
    <div class="flex flex-row">
      <h2 class="grow">{m.transitions_productDetails()}</h2>
      <button
        class="btn btn-ghost"
        type="button"
        onclick={() => {
          detailsModal?.close();
        }}
      >
        <IconContainer icon="mdi:close" width={36} class="opacity-80" />
      </button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>{m.transitions_storeName()}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {product.Store?.Description}
          </td>
        </tr>
      </tbody>
    </table>
    <table class="table">
      <thead>
        <tr>
          <th>{m.transitions_state()}</th>
          <th>{m.transitions_user()}</th>
          <th>{m.transitions_command()}</th>
          <th>{m.transitions_comment()}</th>
          <th>{m.transitions_date()}</th>
        </tr>
      </thead>
      <tbody>
        {#each transitions as transition}
          <tr class:font-bold={isLandmark(transition.TransitionType)}>
            <td>
              {#if transition.TransitionType === ProductTransitionType.Activity}
                {transition.InitialState}
              {:else if transition.TransitionType === ProductTransitionType.ProjectAccess}
                * {transition.InitialState}
              {:else}
                {stateString(transition.WorkflowType ?? 1, transition.TransitionType)}
              {/if}
            </td>
            <td>
              <!-- Does not include WorkflowUserId mapping. Might be needed but didn't seem like it to me -->
              {#if !isLandmark(transition.TransitionType)}
                {transition.User?.Name || transition.AllowedUserNames || m.appName()}
              {/if}
            </td>
            <td>{transition.Command ?? ''}</td>
            <td>
              {#if transition.Comment?.startsWith('system.')}
                {#if transition.Comment.startsWith('system.build-failed')}
                  <span>
                    {m.system_buildFailed()}
                  </span>
                {:else if transition.Comment.startsWith('system.publish-failed')}
                  <span>
                    {m.system_publishFailed()}
                  </span>
                {/if}
                <br />
                <a
                  class="link link-info"
                  href={transition.Comment.replace(/system\.(build|publish)-failed,/, '')}
                  target="_blank"
                >
                  {m.publications_console()}
                </a>
              {:else}
                {transition.Comment ?? ''}
              {/if}
            </td>
            <td>
              {getTimeDateString(transition.DateTransition)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>{m.common_close()}</button>
  </form>
</dialog>

<style>
  /* source: https://github.com/saadeghi/daisyui/issues/3040#issuecomment-2250530354 */
  :root:has(:is(.modal-open, .modal:target, .modal-toggle:checked + .modal, .modal[open])) {
    scrollbar-gutter: unset;
  }
</style>

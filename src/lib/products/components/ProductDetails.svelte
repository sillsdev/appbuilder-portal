<script lang="ts" module>
  /** Shows details modal for product with productId */
  export function showProductDetails(productId: string) {
    // optional chaining for if element isn't found or isn't actually a Dialog Element
    (document.getElementById('modal' + productId) as HTMLDialogElement)?.showModal?.();
  }
</script>

<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { ProductTransitionType } from '$lib/prisma';
  import { getTimeDateString } from '$lib/utils/time';

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
  type Landmark = (typeof landmarks)[number];
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

{#snippet comment(com: (typeof transitions)[0]['Comment'])}
  {#if com?.startsWith('system.')}
    {#if com.startsWith('system.build-failed')}
      <span>
        {m.system_buildFailed()}
      </span>
    {:else if com.startsWith('system.publish-failed')}
      <span>
        {m.system_publishFailed()}
      </span>
    {/if}
    <br />
    <a
      class="link link-info"
      href={com.replace(/system\.(build|publish)-failed,/, '')}
      target="_blank"
    >
      {m.publications_console()}
    </a>
  {:else}
    {com ?? ''}
  {/if}
{/snippet}

<dialog bind:this={detailsModal} id="modal{product.Id}" class="modal">
  <div class="modal-box w-11/12 max-w-6xl">
    <div class="flex flex-row">
      <h1 class="pl-0 grow">{m.transitions_productDetails()}</h1>
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
    <table class="table table-sm">
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
    <table class="table table-sm">
      <thead>
        <tr>
          <th>{m.transitions_state()}</th>
          <th>{m.transitions_user()}</th>
          <th>{m.transitions_command()}</th>
          <th class="hidden md:table-cell">{m.transitions_comment()}</th>
          <th>{m.transitions_date()}</th>
        </tr>
      </thead>
      <tbody>
        {#each transitions as transition}
          <tr class:font-bold={isLandmark(transition.TransitionType)} class="w-full">
            <td>
              {#if transition.TransitionType === ProductTransitionType.Activity}
                {transition.InitialState}
              {:else if transition.TransitionType === ProductTransitionType.ProjectAccess}
                <IconContainer
                  icon="material-symbols:star"
                  width={16}
                />&nbsp;{transition.InitialState}
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
            <td class="w-full max-w-1/3 hidden md:table-cell">
              {@render comment(transition.Comment)}
            </td>
            <td>
              {getTimeDateString(transition.DateTransition)}
            </td>
          </tr>
          {#if transition.Comment}
            <tr class="md:hidden">
              <td colspan="5">{@render comment(transition.Comment)}</td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>{m.common_close()}</button>
  </form>
</dialog>

<style>
  td {
    padding-top: 2px;
    padding-bottom: 2px;
  }
  :where(thead tr, tbody tr:not(:last-child)) {
    @supports (color: color-mix(in lab, red, red)) {
      /* Copied from DaisyUI source. Modified opacity */
      border-bottom: var(--border) solid color-mix(in oklch, var(--color-base-content) 25%, #0000);
    }
  }
</style>

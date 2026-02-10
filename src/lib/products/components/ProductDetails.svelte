<script lang="ts" module>
  /** Shows details modal for product with productId */
  export function showProductDetails(productId: string) {
    // optional chaining for if element isn't found or isn't actually a Dialog Element
    (document.getElementById('modal' + productId) as HTMLDialogElement)?.showModal?.();
  }

  export type Transition = Prisma.ProductTransitionsGetPayload<{
    select: {
      TransitionType: true;
      InitialState: true;
      WorkflowType: true;
      AllowedUserNames: true;
      Command: true;
      Comment: true;
      DateTransition: true;
      User: { select: { Name: true } };
      QueueRecords: {
        select: {
          Queue: true;
          JobId: true;
          JobType: true;
        };
      };
    };
  }>;
</script>

<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import TaskComment from './TaskComment.svelte';
  import { page } from '$app/state';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { ProductTransitionType } from '$lib/prisma';
  import { isSuperAdmin } from '$lib/utils/roles';
  import { getTimeDateString } from '$lib/utils/time';
  import type { WorkflowState } from '$lib/workflowTypes';
  import { isBackground, linkToBuildEngine } from '$lib/workflowTypes';

  interface Props {
    product: Prisma.ProductsGetPayload<{
      select: {
        Id: true;
        Store: { select: { Description: true } };
        BuildEngineJobId: true;
        BuildEngineBuildId: true;
        BuildEngineReleaseId: true;
      };
    }> & { BuildEngineUrl?: string };
    transitions: Transition[];
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

  const isSuper = $derived(isSuperAdmin(page.data.session!.user.roles));
</script>

{#snippet transitionType(transition: (typeof transitions)[0])}
  {#if transition.TransitionType === ProductTransitionType.Activity}
    {transition.InitialState}
  {:else if transition.TransitionType === ProductTransitionType.ProjectAccess}
    <IconContainer icon="material-symbols:star" width={16} />&nbsp;{transition.InitialState}
  {:else}
    {stateString(transition.WorkflowType ?? 1, transition.TransitionType)}
  {/if}
{/snippet}

{#snippet queueRecords(trans: Transition, prod: typeof product)}
  {@const records = trans.QueueRecords}
  {@const back = isBackground(trans.InitialState as WorkflowState)}
  <details class="cursor-pointer">
    <summary>{m.products_jobRecords()} ({records.length + (back ? 1 : 0)})</summary>
    <ul>
      {#if back}
        <li>
          <a
            class="link"
            href={linkToBuildEngine(
              prod.BuildEngineUrl!,
              prod,
              trans.InitialState as WorkflowState
            )}
            target="_blank"
          >
            {m.products_viewInBE()}
          </a>
        </li>
      {/if}
      {#each records as rec}
        <li>
          <a
            class="link"
            href="/admin/jobs/queue/{rec.Queue}/{encodeURIComponent(rec.JobId)}"
            target="_blank"
          >
            {rec.Queue}: {rec.JobType}
          </a>
        </li>
      {/each}
    </ul>
  </details>
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
    <table class="hidden md:table table-sm">
      <thead>
        <tr>
          <th>{m.transitions_state()}</th>
          <th>{m.transitions_user()}</th>
          <th>{m.transitions_command()}</th>
          <th>{m.transitions_date()}</th>
        </tr>
      </thead>
      <tbody>
        {#each transitions as transition}
          {@const showRecs =
            isSuper &&
            transition.DateTransition &&
            (transition.QueueRecords.length ||
              (transition.InitialState && isBackground(transition.InitialState as WorkflowState)))}
          <tr
            class:font-bold={isLandmark(transition.TransitionType)}
            class:no-border={transition.Comment || showRecs}
          >
            <td>
              {@render transitionType(transition)}
            </td>
            <td>
              {#if !isLandmark(transition.TransitionType)}
                {transition.User?.Name || transition.AllowedUserNames || m.appName()}
              {/if}
            </td>
            <td>{transition.Command}</td>
            <td>
              {getTimeDateString(transition.DateTransition)}
            </td>
          </tr>
          {#if showRecs}
            <tr class:no-border={transition.Comment}>
              <td colspan="4">
                {@render queueRecords(transition, product)}
              </td>
            </tr>
          {/if}
          {#if transition.Comment}
            <tr>
              <td colspan="4">
                <TaskComment comment={transition.Comment} />
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
    <table class="table md:hidden table-sm">
      <thead>
        <tr>
          <th>{m.transitions_state()} / {m.transitions_user()}</th>
          <th>{m.transitions_date()} / {m.transitions_command()}</th>
        </tr>
      </thead>
      <tbody>
        {#each transitions as transition}
          {@const showRecs =
            isSuper &&
            transition.DateTransition &&
            (transition.QueueRecords.length ||
              (transition.InitialState && isBackground(transition.InitialState as WorkflowState)))}
          <tr
            class:font-bold={isLandmark(transition.TransitionType)}
            class:no-border={!isLandmark(transition.TransitionType) ||
              transition.Comment ||
              showRecs}
          >
            <td>
              {@render transitionType(transition)}
            </td>
            <td>
              {getTimeDateString(transition.DateTransition)}
            </td>
          </tr>
          {#if !isLandmark(transition.TransitionType)}
            <tr class:no-border={transition.Comment || showRecs}>
              <td>
                {transition.User?.Name || transition.AllowedUserNames || m.appName()}
              </td>
              <td>{transition.Command}</td>
            </tr>
          {/if}
          {#if showRecs}
            <tr class:no-border={transition.Comment}>
              <td colspan="2">
                {@render queueRecords(transition, product)}
              </td>
            </tr>
          {/if}
          {#if transition.Comment}
            <tr>
              <td colspan="2"><TaskComment comment={transition.Comment} /></td>
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
  .no-border {
    border: none;
  }
</style>

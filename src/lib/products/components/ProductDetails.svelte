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

  export interface Props {
    product: Prisma.ProductsGetPayload<{
      select: {
        Id: true;
        Store: { select: { Description: true } };
        BuildEngineJobId: true;
        CurrentBuildId: true;
        CurrentReleaseId: true;
        ProductBuilds: {
          select: {
            BuildEngineBuildId: true;
            DateCreated: true;
          };
        };
        ProductPublications: {
          select: {
            BuildEngineReleaseId: true;
            DateCreated: true;
          };
        };
      };
    }> & { BuildEngineUrl?: string };
    transitions: Transition[];
  }
</script>

<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import type { Prisma } from '@prisma/client';
  import TaskComment from './TaskComment.svelte';
  import { page } from '$app/state';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { ProductTransitionType } from '$lib/prisma';
  import { isSuperAdmin } from '$lib/utils/roles';
  import { getTimeDateString } from '$lib/utils/time';
  import {
    WorkflowState,
    formatBuildEngineLink,
    isBackground,
    linkToBuildEngine
  } from '$lib/workflowTypes';

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

  function getBuildOrPub(trans: Transition) {
    const ret = {
      BuildEngineJobId: product.BuildEngineJobId,
      CurrentBuildId: product.CurrentBuildId,
      CurrentReleaseId: product.CurrentReleaseId
    };
    if (trans.InitialState === WorkflowState.Product_Build) {
      const currentBuild = product.ProductBuilds?.find(
        (pb) => (pb.DateCreated?.valueOf() ?? 0) > (trans.DateTransition?.valueOf() ?? 0)
      );
      if (currentBuild) {
        ret.CurrentBuildId = currentBuild.BuildEngineBuildId;
      }
    } else if (trans.InitialState === WorkflowState.Product_Publish) {
      const currentRelease = product.ProductPublications?.find(
        (pp) => (pp.DateCreated?.valueOf() ?? 0) > (trans.DateTransition?.valueOf() ?? 0)
      );
      if (currentRelease) {
        ret.CurrentReleaseId = currentRelease.BuildEngineReleaseId;
      }
    }
    return ret;
  }
</script>

{#snippet transitionType(transition: (typeof transitions)[0], showRecs: boolean)}
  {#if transition.TransitionType === ProductTransitionType.Activity}
    {@html formatBuildEngineLink(
      linkToBuildEngine(
        (transition.DateTransition &&
          transition.InitialState &&
          isBackground(transition.InitialState as WorkflowState)) ||
          showRecs
          ? product.BuildEngineUrl
          : undefined,
        getBuildOrPub(transition),
        transition.InitialState as WorkflowState
      ),
      transition.InitialState ?? ''
    )}
  {:else if transition.TransitionType === ProductTransitionType.ProjectAccess}
    <IconContainer icon="material-symbols:star" width={16} />&nbsp;{transition.InitialState}
  {:else}
    {stateString(transition.WorkflowType ?? 1, transition.TransitionType)}
  {/if}
{/snippet}

{#snippet queueRecords(trans: Transition)}
  {@const records = trans.QueueRecords}
  <details class="cursor-pointer">
    <summary>{m.products_jobRecords()} ({records.length})</summary>
    <ul>
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
          {@const showRecs = isSuper && !!transition.QueueRecords.length}
          <tr
            class:font-bold={isLandmark(transition.TransitionType)}
            class:no-border={transition.Comment || showRecs}
          >
            <td>
              {@render transitionType(transition, showRecs)}
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
                {@render queueRecords(transition)}
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
          {@const showRecs = isSuper && !!transition.QueueRecords.length}
          <tr
            class:font-bold={isLandmark(transition.TransitionType)}
            class:no-border={!isLandmark(transition.TransitionType) ||
              transition.Comment ||
              showRecs}
          >
            <td>
              {@render transitionType(transition, showRecs)}
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
                {@render queueRecords(transition)}
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

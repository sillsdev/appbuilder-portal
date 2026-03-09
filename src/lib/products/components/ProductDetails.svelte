<script lang="ts" module>
  /** Shows details modal for product with productId */
  export function showProductDetails(productId: string) {
    // optional chaining for if element isn't found or isn't actually a Dialog Element
    (document.getElementById('modal' + productId) as HTMLDialogElement)?.showModal?.();
  }

  export interface Props {
    product: MinifiedProductDetails;
    projectActions?: Action[];
  }
</script>

<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import TaskComment from './TaskComment.svelte';
  import { page } from '$app/state';
  import { Icons, getTransitionIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { ProductTransitionType } from '$lib/prisma';
  import type { MinifiedProductDetails } from '$lib/products';
  import type { Action } from '$lib/projects/components/ProjectActionEntry.svelte';
  import ProjectActionEntry from '$lib/projects/components/ProjectActionEntry.svelte';
  import { isSuperAdmin } from '$lib/utils/roles';
  import { byDate } from '$lib/utils/sorting';
  import { getTimeDateString } from '$lib/utils/time';
  import {
    WorkflowState,
    formatBuildEngineLink,
    isBackground,
    linkToBuildEngine
  } from '$lib/workflowTypes';

  let { product, projectActions = [] }: Props = $props();

  const entries = $derived(
    [...product.PT, ...projectActions].sort((a, b) =>
      byDate('D' in a ? a.D : a.DateAction, 'D' in b ? b.D : b.DateAction)
    )
  );

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

  function getBuildOrPub(trans: MinifiedProductDetails['PT'][number]) {
    const ret = {
      J: product.J,
      CB: 0,
      CR: 0
    };
    if (trans.S === WorkflowState.Product_Build) {
      const currentBuild = product.PB?.find((pb) => pb.T === trans.I);
      if (currentBuild) {
        ret.CB = currentBuild.I;
      }
    } else if (trans.S === WorkflowState.Product_Publish) {
      const currentRelease = product.PR?.find((pp) => pp.T === trans.I);
      if (currentRelease) {
        ret.CR = currentRelease.I;
      }
    }
    return ret;
  }
</script>

{#snippet transitionType(transition: MinifiedProductDetails['PT'][number], showRecs: boolean)}
  {#if transition.T === ProductTransitionType.Activity}
    {@html formatBuildEngineLink(
      linkToBuildEngine(
        (transition.D && transition.S && isBackground(transition.S as WorkflowState)) || showRecs
          ? product.BE
          : undefined,
        getBuildOrPub(transition),
        transition.S as WorkflowState
      ),
      transition.S ?? ''
    )}
  {:else}
    {@const icon = getTransitionIcon(
      transition.T,
      transition.W ?? 1,
      transition.Cd ?? transition.S?.match(/(Download|Upload)/)?.at(1) ?? null
    )}
    {#if icon}
      <IconContainer {icon} width={16} />&nbsp;
    {/if}
    {#if transition.T === ProductTransitionType.ProjectAccess}
      {transition.S}
    {:else if isLandmark(transition.T)}
      {stateString(transition.W ?? 1, transition.T)}
    {:else}
      {m.transitions_types({
        type: transition.T,
        workflowType: ''
      })}
    {/if}
  {/if}
{/snippet}

{#snippet queueRecords(trans: MinifiedProductDetails['PT'][number])}
  {@const records = trans.QR}
  <details class="cursor-pointer">
    <summary>{m.products_jobRecords()} ({records.length})</summary>
    <ul>
      {#each records as rec}
        <li>
          <a
            class="link"
            href="/admin/jobs/queue/{rec.Q}/{encodeURIComponent(rec.I)}"
            target="_blank"
          >
            {rec.Q}: {rec.T}
          </a>
        </li>
      {/each}
    </ul>
  </details>
{/snippet}

<dialog bind:this={detailsModal} id="modal{product.I}" class="modal">
  <div class="modal-box w-11/12 max-w-6xl">
    <div class="flex flex-row">
      <h1 class="pl-0 grow">{m.transitions_productDetails()}</h1>
      <button
        class="btn btn-ghost"
        type="button"
        onclick={() => {
          detailsModal?.close();
        }}
        title={m.common_close()}
      >
        <IconContainer icon={Icons.Close} width={36} class="opacity-80" />
      </button>
    </div>
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
        {#each entries as transition}
          {#if 'D' in transition}
            {@const showRecs = isSuper && !!transition.QR.length}
            <tr
              class:font-bold={isLandmark(transition.T)}
              class:no-border={transition.Ct || showRecs}
            >
              <td>
                {@render transitionType(transition, showRecs)}
              </td>
              <td>
                {#if !isLandmark(transition.T)}
                  {(transition.UI && (transition.UN ?? `User #${transition.UI}`)) ||
                    transition.AU ||
                    m.appName()}
                {/if}
              </td>
              <td>
                {transition.T === ProductTransitionType.Activity ? transition.Cd : ''}
              </td>
              <td>
                {getTimeDateString(transition.D)}
              </td>
            </tr>
            {#if showRecs}
              <tr class:no-border={transition.Ct}>
                <td colspan="4">
                  {@render queueRecords(transition)}
                </td>
              </tr>
            {/if}
            {#if transition.Ct}
              <tr>
                <td colspan="4">
                  <TaskComment comment={transition.Ct} />
                </td>
              </tr>
            {/if}
          {:else}
            <ProjectActionEntry act={transition} compact={false} />
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
        {#each entries as transition}
          {#if 'D' in transition}
            {@const showRecs = isSuper && !!transition.QR.length}
            <tr
              class:font-bold={isLandmark(transition.T)}
              class:no-border={!isLandmark(transition.T) || transition.Ct || showRecs}
            >
              <td>
                {@render transitionType(transition, showRecs)}
              </td>
              <td>
                {getTimeDateString(transition.D)}
              </td>
            </tr>
            {#if !isLandmark(transition.T)}
              <tr class:no-border={transition.Ct || showRecs}>
                <td>
                  {(transition.UI && (transition.UN ?? `User #${transition.UI}`)) ||
                    transition.AU ||
                    m.appName()}
                </td>
                <td>
                  {transition.T === ProductTransitionType.Activity ? transition.Cd : ''}
                </td>
              </tr>
            {/if}
            {#if showRecs}
              <tr class:no-border={transition.Ct}>
                <td colspan="2">
                  {@render queueRecords(transition)}
                </td>
              </tr>
            {/if}
            {#if transition.Ct}
              <tr>
                <td colspan="2"><TaskComment comment={transition.Ct} /></td>
              </tr>
            {/if}
          {:else}
            <ProjectActionEntry act={transition} compact={true} />
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
  table :global(:where(thead tr)) {
    @supports (color: color-mix(in lab, red, red)) {
      /* Copied from DaisyUI source. Modified opacity */
      border-bottom: var(--border) solid color-mix(in oklch, var(--color-base-content) 25%, #0000);
    }
  }
  table :global(:where(tbody tr:not(:last-child))) {
    @supports (color: color-mix(in lab, red, red)) {
      /* Copied from DaisyUI source. Modified opacity */
      border-bottom: var(--border) solid color-mix(in oklch, var(--color-base-content) 25%, #0000);
    }
  }
  .no-border {
    border: none;
  }
</style>

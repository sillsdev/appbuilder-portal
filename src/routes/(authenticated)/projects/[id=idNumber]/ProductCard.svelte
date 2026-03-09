<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import type { Prisma } from '@prisma/client';
  import DeleteProduct from './modals/DeleteProduct.svelte';
  import Properties from './modals/Properties.svelte';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { Icons, getActionIcon, getProductIcon, getStoreIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { BuildStatus } from '$lib/prisma';
  import { ProductActionType, getProductActions } from '$lib/products';
  import { type MinifiedProductCard } from '$lib/products';
  import ProductDetails, {
    type Props as ProductDetailProps,
    showProductDetails
  } from '$lib/products/components/ProductDetails.svelte';
  import type { Action } from '$lib/projects/components/ProjectActionEntry.svelte';
  import { sanitizeInput, toast } from '$lib/utils';
  import { isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';
  import {
    ProductType,
    WorkflowState,
    formatBuildEngineLink,
    isBackground,
    linkToBuildEngine
  } from '$lib/workflowTypes';

  interface Props {
    project: Prisma.ProjectsGetPayload<{
      select: {
        Id: true;
        Name: true;
        DateArchived: true;
        OrganizationId: true;
        OwnerId: true;
      };
    }>;
    product: Prisma.ProductsGetPayload<{
      select: {
        ProductDefinition: {
          select: {
            Name: true;
            Workflow: {
              select: {
                ProductType: true;
              };
            };
            RebuildWorkflowId: true;
            RepublishWorkflowId: true;
          };
        };
        Store: { select: { StoreTypeId: true; Description: true } };
      };
    }> &
      MinifiedProductCard &
      ProductDetailProps['product'];
    actionEndpoint: string;
    deleteEndpoint: string;
    updateEndpoint: string;
    canEdit: boolean;
    projectActions: Action[];
  }

  let {
    product,
    project,
    actionEndpoint,
    deleteEndpoint,
    updateEndpoint,
    canEdit,
    projectActions
  }: Props = $props();

  let deleteProductModal: HTMLDialogElement | undefined = $state(undefined);
  let updateProductModal: HTMLDialogElement | undefined = $state(undefined);
  const showTaskWaiting = $derived(!!product.WS);

  const highlighted = $derived(page.url.hash.substring(1));
  const actions = $derived(canEdit ? getProductActions(product) : []);

  async function handleProductAction(productId: string, action: string) {
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('productAction', action);

      const response = await fetch(`${page.url.pathname}?/${actionEndpoint}`, {
        method: 'POST',
        body: formData
      });

      if (response.status === 503) {
        toast('error', m.system_unavailable());
      } else if (!response.ok) {
        throw new Error('Network response was not ok');
      } else {
        invalidateAll();
      }
    } catch (error) {
      console.error('Error performing product action:', error);
    }
  }
  const waitTime = $derived(getRelativeTime(product.UT.slice(-1)[0]?.D ?? product.PrT ?? null));
  const updatedTime = $derived(getRelativeTime(product.DU));
  const publishedTime = $derived(getRelativeTime(product.DP));
</script>

<div
  class={[
    'rounded-md border border-slate-400 w-full my-2',
    product.I === highlighted && 'border-2 border-accent!'
  ]}
  id={product.I}
>
  <div class="bg-neutral p-2 flex flex-col rounded-t-md" class:rounded-b-md={!showTaskWaiting}>
    <div class="flex flex-row items-start">
      <IconContainer
        icon={getProductIcon(product.ProductDefinition.Workflow.ProductType)}
        width={30}
      />
      <a
        class="min-w-0 grow hover:underline ml-0.5"
        href={localizeHref(`/projects/${project.Id}#${product.I}`)}
      >
        {product.ProductDefinition.Name}
      </a>
      <Dropdown
        class={{
          label: 'px-1 btn-square btn-xs',
          content: 'drop-arrow bottom-12 right-0 p-1 min-w-36 w-auto'
        }}
      >
        {#snippet label()}
          <IconContainer icon={Icons.Kebab} width="20" class="" />
        {/snippet}
        {#snippet content()}
          <ul class="menu overflow-hidden rounded-md">
            <li class="w-full rounded-none">
              <button class="text-nowrap" onclick={() => showProductDetails(product.I)}>
                <IconContainer icon={Icons.Info} width={16} />
                {m.products_details()}
              </button>
            </li>
            <li class="w-full rounded-none">
              <a href={localizeHref(`/products/${product.I}/files`)} class="text-nowrap">
                <IconContainer icon={Icons.Directory} width={16} />
                {m.project_productFiles()}
              </a>
            </li>
            {#if isAdminForOrg(project.OrganizationId, page.data.session!.user.roles)}
              <li class="w-full rounded-none">
                <button class="text-nowrap" onclick={() => updateProductModal?.showModal()}>
                  <IconContainer icon={Icons.Settings} width={16} />
                  {m.products_properties_title()}
                </button>
              </li>
            {/if}
            {#if canEdit}
              <li class="w-full rounded-none">
                <BlockIfJobsUnavailable class="text-nowrap text-error">
                  {#snippet altContent()}
                    <IconContainer icon={Icons.Trash} width={16} />
                    {m.models_delete({ name: m.tasks_product() })}
                  {/snippet}
                  <button
                    class="text-nowrap text-error"
                    onclick={() => deleteProductModal?.showModal()}
                  >
                    {@render altContent()}
                  </button>
                </BlockIfJobsUnavailable>
              </li>
            {/if}
          </ul>
        {/snippet}
      </Dropdown>
    </div>
    <div class="flex flex-row gap-2 py-1">
      <div class="flex flex-row gap-1 grow">
        <IconContainer
          icon={getStoreIcon(product.Store?.StoreTypeId ?? 0)}
          width={24}
          class="mx-0.5"
        />
        {#if product.L}
          <a class="link" href={product.L} target="_blank">
            {product.Store?.Description}
          </a>
        {:else}
          {product.Store?.Description}
        {/if}
        <span class="hidden sm:inline-block">
          {#if product.DP}
            [<Tooltip tip={getTimeDateString(product.DP)}>
              {$publishedTime}
            </Tooltip>]
          {/if}
        </span>
      </div>
      {#if product.L}
        {@const pType = product.ProductDefinition.Workflow.ProductType}
        {#if pType !== ProductType.Web}
          <a
            class="link"
            href="/api/products/{product.I}/files/published/{pType === ProductType.AssetPackage
              ? 'asset-package'
              : 'apk'}"
            target="_blank"
          >
            <IconContainer icon={Icons.Download} width={24} />
          </a>
        {/if}
      {/if}
    </div>
    <div class="flex flex-row gap-2">
      <div class="flex flex-row gap-1 grow">
        {m.common_updated()}:
        <Tooltip tip={getTimeDateString(product.DP)}>
          {$updatedTime}
        </Tooltip>
      </div>
    </div>
    <div class="flex flex-row gap-2 sm:hidden">
      <div class="flex flex-row gap-1 grow">
        {m.products_published()}:
        <Tooltip tip={getTimeDateString(product.DP)}>
          {$publishedTime}
        </Tooltip>
      </div>
    </div>
    <div class="flex flex-row gap-2 p-1 mt-1 rounded-md">
      <button
        class="text-nowrap btn btn-secondary btn-sm"
        onclick={() => showProductDetails(product.I)}
      >
        <IconContainer icon={Icons.Info} width={20} />
        {m.products_details()}
      </button>
      {#each actions as action}
        {@const message =
          //@ts-expect-error this is in fact correct
          m['products_acts_' + action]({
            workflow: m.flowDefs_types({
              type: product.WT ?? 0
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)}
        {#if !((action === ProductActionType.StopBuild && product.ABS === BuildStatus.PostProcessing) || (action === ProductActionType.StopPublish && product.APS === BuildStatus.PostProcessing))}
          <BlockIfJobsUnavailable class="text-nowrap">
            {#snippet altContent()}
              <IconContainer icon={getActionIcon(action)} width={20} />
              {message}
            {/snippet}
            <button
              class="text-nowrap btn btn-secondary btn-sm"
              onclick={(event) => {
                handleProductAction(product.I, action);
                event.currentTarget.blur();
              }}
            >
              {@render altContent()}
            </button>
          </BlockIfJobsUnavailable>
        {/if}
      {/each}
    </div>
    {#if canEdit}
      <DeleteProduct
        bind:modal={deleteProductModal}
        {product}
        endpoint={deleteEndpoint}
        project={project.Name ?? m.tasks_project()}
      />
      <Properties bind:modal={updateProductModal} {product} endpoint={updateEndpoint} />
    {/if}
  </div>
  {#if showTaskWaiting}
    <div class="p-2 flex flex-col gap-1">
      <div class="flex flex-col md:flex-row gap-1">
        {#if project.DateArchived}
          <span>
            {@html m.tasks_archivedAt({
              activityName: sanitizeInput(product.AcT?.S ?? '')
            })}
          </span>
        {:else}
          <span>
            <b>
              {@html formatBuildEngineLink(
                linkToBuildEngine(
                  isSuperAdmin(page.data.session!.user.roles) &&
                    product.WS &&
                    isBackground(product.WS as WorkflowState)
                    ? product.BE
                    : undefined,
                  product,
                  product.WS as WorkflowState
                ),
                product.AcT?.S ?? ''
              )}
            </b>
            {#snippet statusBadge(status: string)}
              <span
                class="badge font-bold
                  {status === BuildStatus.Pending
                  ? 'badge-secondary text-secondary-content'
                  : status === BuildStatus.PostProcessing
                    ? 'badge-warning text-warning-content'
                    : 'badge-info text-info-content'}
                "
              >
                {status}
              </span>
            {/snippet}
            {#if product.WS === WorkflowState.Product_Build && product.ABS}
              {@render statusBadge(product.ABS)}
            {:else if product.WS === WorkflowState.Product_Publish && product.APS}
              {@render statusBadge(product.APS)}
            {/if}
            &mdash;
            {m.tasks_waiting({
              allowedNames: product.AcT?.AU || m.appName()
            })}
            &bull;
            {$waitTime}
          </span>
        {/if}
      </div>
      <div class="flex flex-row gap-2">
        {#if product.UT.find((ut) => ut.U === page.data.session?.user.userId)}
          <a class="link" href={localizeHref(`/tasks/${product.I}`)}>
            {m.common_continue()}
          </a>
        {/if}
        {#if isSuperAdmin(page.data.session!.user.roles) && !!product.WS}
          <a class="link" href={localizeHref(`/workflow-instances/${product.I}`)}>
            {m.common_workflow()}
          </a>
        {/if}
      </div>
    </div>
  {/if}
  <ProductDetails {product} {projectActions} />
</div>

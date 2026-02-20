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
  import { Icons, getActionIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { type ProductActionType } from '$lib/products';
  import ProductDetails, {
    type Props as ProductDetailProps,
    type Transition,
    showProductDetails
  } from '$lib/products/components/ProductDetails.svelte';
  import { sanitizeInput, toast } from '$lib/utils';
  import { isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';
  import type { WorkflowState } from '$lib/workflowTypes';
  import {
    ProductType,
    formatBuildEngineLink,
    isBackground,
    linkToBuildEngine
  } from '$lib/workflowTypes';

  interface Props {
    project: Prisma.ProjectsGetPayload<{
      select: {
        Name: true;
        DateArchived: true;
        OrganizationId: true;
      };
    }>;
    product: Prisma.ProductsGetPayload<{
      select: {
        DatePublished: true;
        DateUpdated: true;
        Properties: true;
        PublishLink: true;
        ProductDefinition: {
          select: {
            Name: true;
            Workflow: {
              select: {
                ProductType: true;
              };
            };
          };
        };
        UserTasks: {
          select: {
            UserId: true;
            DateCreated: true;
          };
        };
        WorkflowInstance: {
          select: {
            State: true;
          };
        };
      };
    }> & {
      Transitions: Transition[];
      actions: ProductActionType[];
      ActiveTransition?: Transition;
      PreviousTransition?: Transition;
    } & ProductDetailProps['product'];
    actionEndpoint: string;
    deleteEndpoint: string;
    updateEndpoint: string;
    canEdit: boolean;
  }

  let { product, project, actionEndpoint, deleteEndpoint, updateEndpoint, canEdit }: Props =
    $props();

  let deleteProductModal: HTMLDialogElement | undefined = $state(undefined);
  let updateProductModal: HTMLDialogElement | undefined = $state(undefined);
  const showTaskWaiting = $derived(!!product.WorkflowInstance);

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
  const waitTime = $derived(
    getRelativeTime(
      product.UserTasks.slice(-1)[0]?.DateCreated ??
        product.PreviousTransition?.DateTransition ??
        null
    )
  );
  const updatedTime = $derived(getRelativeTime(product.DateUpdated));
  const publishedTime = $derived(getRelativeTime(product.DatePublished));
</script>

<div class="rounded-md border border-slate-400 w-full my-2">
  <div class="bg-neutral p-2 flex flex-col rounded-t-md" class:rounded-b-md={!showTaskWaiting}>
    <div class="flex flex-row items-start">
      <IconContainer icon={getIcon(product.ProductDefinition.Name ?? '')} width={30} />
      <span class="min-w-0 grow">
        {product.ProductDefinition.Name}
      </span>
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
              <button class="text-nowrap" onclick={() => showProductDetails(product.Id)}>
                <IconContainer icon={Icons.Info} width={16} />
                {m.products_details()}
              </button>
            </li>
            <li class="w-full rounded-none">
              <a href={localizeHref(`/products/${product.Id}/files`)} class="text-nowrap">
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
    <div class="flex flex-row gap-2">
      <div class="flex flex-row gap-1 grow">
        {m.common_updated()}:
        <Tooltip tip={getTimeDateString(product.DateUpdated)}>
          {$updatedTime}
        </Tooltip>
      </div>
      {#if product.PublishLink}
        <a class="link" href={product.PublishLink} target="_blank">
          <IconContainer icon={Icons.Store} width={24} />
        </a>
      {/if}
    </div>
    <div class="flex flex-row gap-2">
      <div class="flex flex-row gap-1 grow">
        {m.products_published()}:
        <Tooltip tip={getTimeDateString(product.DatePublished)}>
          {$publishedTime}
        </Tooltip>
      </div>
      {#if product.PublishLink}
        {@const pType = product.ProductDefinition.Workflow.ProductType}
        {#if pType !== ProductType.Web}
          <a
            class="link"
            href="/api/products/{product.Id}/files/published/{pType === ProductType.AssetPackage
              ? 'asset-package'
              : 'apk'}"
            target="_blank"
          >
            <IconContainer icon={Icons.Download} width={24} />
          </a>
        {/if}
      {/if}
    </div>
    <div class="flex flex-row gap-2 p-1 mt-1 rounded-md">
      <button
        class="text-nowrap btn btn-secondary btn-sm"
        onclick={() => showProductDetails(product.Id)}
      >
        <IconContainer icon={Icons.Info} width={20} />
        {m.products_details()}
      </button>
      {#each product.actions as action}
        {@const message =
          //@ts-expect-error this is in fact correct
          m['products_acts_' + action]()}
        <BlockIfJobsUnavailable class="text-nowrap">
          {#snippet altContent()}
            <IconContainer icon={getActionIcon(action)} width={20} />
            {message}
          {/snippet}
          <button
            class="text-nowrap btn btn-secondary btn-sm"
            onclick={(event) => {
              handleProductAction(product.Id, action);
              event.currentTarget.blur();
            }}
          >
            {@render altContent()}
          </button>
        </BlockIfJobsUnavailable>
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
              activityName: sanitizeInput(product.ActiveTransition?.InitialState ?? '')
            })}
          </span>
        {:else}
          <span>
            <span class="text-red-500">
              {m.tasks_waiting({
                // waiting since EITHER (the last task exists) -> that task's creation time
                // OR (there are no tasks for this product) -> the last completed transition's completion time
                waitTime: $waitTime
              })}
            </span>
            {@html m.tasks_forNames({
              allowedNames: sanitizeInput(
                product.ActiveTransition?.AllowedUserNames || m.appName()
              ),
              activityName: formatBuildEngineLink(
                linkToBuildEngine(
                  isSuperAdmin(page.data.session!.user.roles) &&
                    product.WorkflowInstance &&
                    isBackground(product.WorkflowInstance.State as WorkflowState)
                    ? product.BuildEngineUrl
                    : undefined,
                  product,
                  product.WorkflowInstance?.State as WorkflowState
                ),
                product.ActiveTransition?.InitialState ?? ''
              )
            })}
          </span>
        {/if}
      </div>
      <div class="flex flex-row gap-2">
        {#if product.UserTasks.find((ut) => ut.UserId === page.data.session?.user.userId)}
          <a class="link" href={localizeHref(`/tasks/${product.Id}`)}>
            {m.common_continue()}
          </a>
        {/if}
        {#if isSuperAdmin(page.data.session!.user.roles) && !!product.WorkflowInstance}
          <a class="link" href={localizeHref(`/workflow-instances/${product.Id}`)}>
            {m.common_workflow()}
          </a>
        {/if}
      </div>
    </div>
  {/if}
  <ProductDetails {product} transitions={product.Transitions} />
</div>

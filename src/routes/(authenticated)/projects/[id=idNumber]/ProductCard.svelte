<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import type { Prisma } from '@prisma/client';
  import DeleteProduct from './modals/DeleteProduct.svelte';
  import Properties from './modals/Properties.svelte';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import type { ProductActionType } from '$lib/products';
  import ProductDetails, {
    showProductDetails
  } from '$lib/products/components/ProductDetails.svelte';
  import { sanitizeInput, toast } from '$lib/utils';
  import { isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
  import { getRelativeTime } from '$lib/utils/time';
  import { ProductType } from '$lib/workflowTypes';

  type Transition = Prisma.ProductTransitionsGetPayload<{
    select: {
      TransitionType: true;
      InitialState: true;
      WorkflowType: true;
      AllowedUserNames: true;
      Command: true;
      Comment: true;
      DateTransition: true;
      User: {
        select: {
          Name: true;
        };
      };
    };
  }>;

  interface Props {
    project: Prisma.ProjectsGetPayload<{
      select: {
        Name: true;
        DateArchived: true;
        Organization: {
          select: {
            Id: true;
          };
        };
      };
    }>;
    product: Prisma.ProductsGetPayload<{
      select: {
        Id: true;
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
        Store: {
          select: {
            Description: true;
          };
        };
        UserTasks: {
          select: {
            UserId: true;
            DateCreated: true;
          };
        };
      };
    }> & {
      Transitions: Transition[];
      WorkflowInstance: unknown;
      actions: ProductActionType[];
      ActiveTransition?: Transition;
      PreviousTransition?: Transition;
    };
    actionEndpoint: string;
    deleteEndpoint: string;
    updateEndpoint: string;
  }

  let { product, project, actionEndpoint, deleteEndpoint, updateEndpoint }: Props = $props();

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
  <div class="bg-neutral p-2 flex flex-row rounded-t-md" class:rounded-b-md={!showTaskWaiting}>
    <span class="grow min-w-0">
      <IconContainer icon={getIcon(product.ProductDefinition.Name ?? '')} width="32" />
      {product.ProductDefinition.Name}
    </span>
    {#if product.PublishLink}
      {@const pType = product.ProductDefinition.Workflow.ProductType}
      <span class="flex flex-col px-2">
        <a class="link" href={product.PublishLink} target="_blank">
          <IconContainer icon="ic:twotone-store" width={24} />
        </a>
        {#if pType !== ProductType.Web}
          <a
            class="link"
            href="/api/products/{product.Id}/files/published/{pType === ProductType.AssetPackage
              ? 'asset-package'
              : 'apk'}"
            target="_blank"
          >
            <IconContainer icon="mdi:launch" width={24} />
          </a>
        {/if}
      </span>
    {/if}
    <span class="w-32 inline-block">
      {m.common_updated()}
      <br />
      <Tooltip tip={product.DateUpdated?.toLocaleString(getLocale())}>
        {$updatedTime}
      </Tooltip>
    </span>
    <span class="w-32 inline-block">
      {m.products_published()}
      <br />
      <Tooltip tip={product.DatePublished?.toLocaleString(getLocale())}>
        {$publishedTime}
      </Tooltip>
    </span>
    <Dropdown labelClasses="px-1" contentClasses="drop-arrow bottom-12 right-0 p-1 min-w-36 w-auto">
      {#snippet label()}
        <IconContainer icon="charm:menu-kebab" width="20" />
      {/snippet}
      {#snippet content()}
        <ul class="menu menu-compact overflow-hidden rounded-md">
          {#each product.actions as action}
            {@const message =
              //@ts-expect-error this is in fact correct
              m['products_acts_' + action]()}
            <li class="w-full rounded-none">
              <BlockIfJobsUnavailable className="text-nowrap">
                {#snippet altContent()}
                  {message}
                {/snippet}
                <button
                  class="text-nowrap"
                  onclick={(event) => {
                    handleProductAction(product.Id, action);
                    event.currentTarget.blur();
                  }}
                >
                  {message}
                </button>
              </BlockIfJobsUnavailable>
            </li>
          {/each}
          <li class="w-full rounded-none">
            <button class="text-nowrap" onclick={() => showProductDetails(product.Id)}>
              {m.products_details()}
            </button>
          </li>
          <li class="w-full rounded-none">
            <a href={localizeHref(`/products/${product.Id}/files`)} class="text-nowrap">
              {m.project_productFiles()}
            </a>
          </li>
          {#if isAdminForOrg(project.Organization.Id, page.data.session?.user.roles)}
            <li class="w-full rounded-none">
              <button class="text-nowrap" onclick={() => updateProductModal?.showModal()}>
                {m.products_properties_title()}
              </button>
            </li>
          {/if}
          {#if isSuperAdmin(page.data.session?.user.roles) && !!product.WorkflowInstance}
            <li class="w-full rounded-none">
              <a href={localizeHref(`/workflow-instances/${product.Id}`)}>
                {m.common_workflow()}
              </a>
            </li>
          {/if}
          <li class="w-full rounded-none">
            <BlockIfJobsUnavailable className="text-nowrap text-error">
              {#snippet altContent()}
                {m.models_delete({ name: m.tasks_product() })}
              {/snippet}
              <button
                class="text-nowrap text-error"
                onclick={() => deleteProductModal?.showModal()}
              >
                {m.models_delete({ name: m.tasks_product() })}
              </button>
            </BlockIfJobsUnavailable>
          </li>
        </ul>
      {/snippet}
    </Dropdown>
    <DeleteProduct
      bind:modal={deleteProductModal}
      {product}
      endpoint={deleteEndpoint}
      project={project.Name ?? m.tasks_project()}
    />
    <Properties bind:modal={updateProductModal} {product} endpoint={updateEndpoint} />
  </div>
  {#if showTaskWaiting}
    <div class="p-2 flex gap-1">
      {#if project.DateArchived}
        {@html m.tasks_archivedAt({
          activityName: sanitizeInput(product.ActiveTransition?.InitialState ?? '')
        })}
      {:else}
        <span class="text-red-500">
          {m.tasks_waiting({
            // waiting since EITHER (the last task exists) -> that task's creation time
            // OR (there are no tasks for this product) -> the last completed transition's completion time
            waitTime: $waitTime
          })}
        </span>
        {@html m.tasks_forNames({
          allowedNames: sanitizeInput(product.ActiveTransition?.AllowedUserNames || m.appName()),
          activityName: sanitizeInput(product.ActiveTransition?.InitialState ?? '')
          // activityName appears to show up blank primarily at the very startup of a new product?
        })}
        {#if product.UserTasks.find((ut) => ut.UserId === page.data.session?.user.userId)}
          <a class="link mx-2" href={localizeHref(`/tasks/${product.Id}`)}>
            {m.common_continue()}
          </a>
        {/if}
      {/if}
    </div>
  {/if}
  <ProductDetails {product} transitions={product.Transitions} />
</div>

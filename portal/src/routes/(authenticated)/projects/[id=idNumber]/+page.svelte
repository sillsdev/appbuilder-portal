<script lang="ts">
  import { page } from '$app/state';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { l10nMap, tryLocalizeName } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import ProductDetails, {
    showProductDetails
  } from '$lib/products/components/ProductDetails.svelte';
  import ProjectActionMenu from '$lib/projects/components/ProjectActionMenu.svelte';
  import { isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
  import { byName } from '$lib/utils/sorting';
  import { getRelativeTime } from '$lib/utils/time';
  import { ProductType } from 'sil.appbuilder.portal.common/workflow';
  import type { PageData } from './$types';
  import { Authors, OwnerGroup, Reviewers, Settings } from './forms';
  import { AddProduct, DeleteProduct, Properties } from './modals';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  async function handleProductAction(productId: string, action: string) {
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('productAction', action);

      const response = await fetch(`${page.url.pathname}?/productAction`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error performing product action:', error);
    }
  }
  let addProductModal: HTMLDialogElement | undefined = $state(undefined);
  let deleteProductModal: HTMLDialogElement | undefined = $state(undefined);
  let updateProductModal: HTMLDialogElement | undefined = $state(undefined);
</script>

<div class="w-full max-w-6xl mx-auto relative">
  <div class="flex p-6">
    <div class="shrink">
      <h1 class="p-0">
        {data.project?.Name}
      </h1>
      <div>
        <span class="font-bold">
          {data.project?.IsPublic ? m.project_public() : m.project_private()}
        </span>
        <span>-</span>
        <span>
          {m.project_createdOn()}
          <Tooltip tip={data.project?.DateCreated?.toLocaleString(getLocale())}>
            {data.project?.DateCreated ? getRelativeTime(data.project?.DateCreated) : 'null'}
          </Tooltip>
        </span>
      </div>
      {#if data.project?.DateArchived}
        <span>
          {m.project_archivedOn()}
          <Tooltip tip={data.project?.DateArchived?.toLocaleString(getLocale())}>
            {data.project?.DateArchived ? getRelativeTime(data.project?.DateArchived) : 'null'}
          </Tooltip>
        </span>
      {/if}
    </div>
    <div class="grow">
      <Tooltip className="tooltip-bottom" tip={m.project_editProject()}>
        <a
          href={localizeHref(`/projects/${data.project?.Id}/edit`)}
          title={m.project_editProject()}
        >
          <IconContainer width="24" icon="mdi:pencil" />
        </a>
      </Tooltip>
    </div>
    <div class="shrink">
      <ProjectActionMenu
        data={data.actionForm}
        project={data.project}
        userGroups={data.userGroups}
        orgId={data.project.Organization.Id}
      />
    </div>
  </div>
  <div class="grid maingrid w-full p-4 pb-0">
    <div class="mainarea min-w-0">
      <h2 class="pl-0">{m.project_details_title()}</h2>
      <div>
        <div class="gridcont grid gap-x-6 gap-y-2">
          <div class="flex place-content-between">
            <span>
              <IconContainer icon="ph:globe" width={20} />
              {m.project_details_language()}:
            </span>
            <span>
              {data.project?.Language} ({tryLocalizeName(
                data.langtags,
                l10nMap.value,
                getLocale(),
                data.project.Language ?? ''
              )})
            </span>
          </div>
          <div class="flex place-content-between">
            <span>{m.project_details_type()}:</span>
            <span>{data.project?.ApplicationType.Description}</span>
          </div>
        </div>
        <div class="my-4">
          <span>{m.project_projectDescription()}:</span>
          <br />
          <p>{data.project?.Description}</p>
        </div>
        {#if data.project?.WorkflowProjectUrl}
          <div>
            <span>{m.project_side_repositoryLocation()}:</span>
            <br />
            <p class="rounded-md text-nowrap overflow-x-scroll bg-base-200 p-3 pt-2 mt-2">
              {data.project?.WorkflowProjectUrl}
            </p>
          </div>
        {/if}
      </div>
      <div class="flex flex-row place-content-between items-end">
        <div>
          <h2 class="pl-0">{m.project_products_title()}</h2>
          <div class="mb-2">
            <span class="italic">{m.products_definition()}</span>
          </div>
        </div>
        <button
          class="btn btn-outline"
          onclick={() => addProductModal?.showModal()}
          disabled={!(data.productsToAdd.length && data.project.WorkflowProjectUrl)}
        >
          {m.project_products_add()}
        </button>
        <AddProduct
          bind:modal={addProductModal}
          prodDefs={data.productsToAdd}
          stores={data.stores}
        />
      </div>
      <!-- Products List -->
      <div>
        {#if !data.project?.Products.length}
          {m.projectTable_noProducts()}
        {:else}
          {@const locale = getLocale()}
          {#each data.project.Products.toSorted( (a, b) => byName(a.ProductDefinition, b.ProductDefinition, locale) ) as product}
            {@const showTaskWaiting = product.WorkflowInstance}
            <div class="rounded-md border border-slate-400 w-full my-2">
              <div
                class="bg-neutral p-2 flex flex-row rounded-t-md"
                class:rounded-b-md={!showTaskWaiting}
              >
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
                        href="/api/products/{product.Id}/files/published/{pType ===
                        ProductType.AssetPackage
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
                  {m.project_products_updated()}
                  <br />
                  <Tooltip tip={product.DateUpdated?.toLocaleString(locale)}>
                    {getRelativeTime(product.DateUpdated)}
                  </Tooltip>
                </span>
                <span class="w-32 inline-block">
                  {m.project_products_published()}
                  <br />
                  <Tooltip tip={product.DatePublished?.toLocaleString(locale)}>
                    {getRelativeTime(product.DatePublished)}
                  </Tooltip>
                </span>
                <Dropdown
                  labelClasses="px-1"
                  contentClasses="drop-arrow bottom-12 right-0 p-1 min-w-36 w-auto"
                >
                  {#snippet label()}
                    <IconContainer icon="charm:menu-kebab" width="20" />
                  {/snippet}
                  {#snippet content()}
                    <ul class="menu menu-compact overflow-hidden rounded-md">
                      {#each product.actions as action}
                        {@const message =
                          //@ts-expect-error this is in fact correct
                          m['products_actions_' + action]()}
                        <li class="w-full rounded-none">
                          <button
                            class="text-nowrap"
                            onclick={(event) => {
                              handleProductAction(product.Id, action);
                              event.currentTarget.blur();
                            }}
                          >
                            {message}
                          </button>
                        </li>
                      {/each}
                      <li class="w-full rounded-none">
                        <button class="text-nowrap" onclick={() => showProductDetails(product.Id)}>
                          {m.project_products_popup_details()}
                        </button>
                      </li>
                      <li class="w-full rounded-none">
                        <a href={localizeHref(`/products/${product.Id}/files`)} class="text-nowrap">
                          {m.project_productFiles()}
                        </a>
                      </li>
                      {#if isAdminForOrg(data.project?.Organization.Id, data.session?.user.roles)}
                        <li class="w-full rounded-none">
                          <button
                            class="text-nowrap"
                            onclick={() => updateProductModal?.showModal()}
                          >
                            {m.project_products_popup_properties()}
                          </button>
                        </li>
                      {/if}
                      {#if isSuperAdmin(data.session?.user.roles) && !!product.WorkflowInstance}
                        <li class="w-full rounded-none">
                          <a href={localizeHref(`/workflow-instances/${product.Id}`)}>
                            {m.common_workflow()}
                          </a>
                        </li>
                      {/if}
                      <li class="w-full rounded-none">
                        <button
                          class="text-nowrap text-error"
                          onclick={() => deleteProductModal?.showModal()}
                        >
                          {m.models_delete({ name: m.tasks_product() })}
                        </button>
                      </li>
                    </ul>
                  {/snippet}
                </Dropdown>
                <DeleteProduct
                  bind:modal={deleteProductModal}
                  {product}
                  endpoint="deleteProduct"
                  project={data.project.Name ?? m.tasks_project()}
                />
                <Properties bind:modal={updateProductModal} {product} endpoint="updateProduct" />
              </div>
              {#if showTaskWaiting}
                <div class="p-2 flex gap-1">
                  {#if data.project.DateArchived}
                    {@html m.tasks_archivedAt({
                      activityName: product.ActiveTransition?.InitialState ?? ''
                    })}
                  {:else}
                    <span class="text-red-500">
                      {m.tasks_waiting({
                        // waiting since EITHER (the last task exists) -> that task's creation time
                        // OR (there are no tasks for this product) -> the last completed transition's completion time
                        waitTime: getRelativeTime(
                          product.UserTasks.slice(-1)[0]?.DateCreated ??
                            product.PreviousTransition?.DateTransition ??
                            null
                        )
                      })}
                    </span>
                    {@html m.tasks_forNames({
                      allowedNames: product.ActiveTransition?.AllowedUserNames || m.appName(),
                      activityName: product.ActiveTransition?.InitialState ?? ''
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
          {/each}
        {/if}
        <div class="divider"></div>
      </div>
    </div>
    <!-- Settings -->
    <div class="settingsarea my-4">
      <Settings project={data.project} />
    </div>
    <!-- Sidebar Settings -->
    <div class="space-y-2 min-w-0 flex-auto sidebararea">
      <OwnerGroup
        project={data.project}
        users={data.possibleProjectOwners}
        groups={data.possibleGroups}
        orgName={data.organizations.find((o) => o.Id === data.project.Organization.Id)?.Name}
      />
      <Authors
        group={data.project.Group}
        projectAuthors={data.project.Authors}
        availableAuthors={data.authorsToAdd}
        formData={data.authorForm}
      />
      <Reviewers reviewers={data.project.Reviewers} formData={data.reviewerForm} />
    </div>
  </div>
</div>

<style>
  .gridcont {
    grid-template-columns: repeat(auto-fill, minmax(48%, 1fr));
  }
  .gridcont div span:first-child {
    font-family: Montserrat, sans-serif;
  }
  .gridcont div span:last-child {
    text-align: right;
  }
  .mainarea {
    grid-area: main;
  }
  .settingsarea {
    grid-area: settings;
  }
  .sidebararea {
    grid-area: sidebar;
  }
  @media (max-width: 700px) {
    .maingrid {
      grid-template-columns: 1fr !important;
      grid-template-areas:
        'main'
        'sidebar'
        'settings' !important;
    }
  }
  .maingrid {
    grid-template-areas:
      'main sidebar'
      'settings sidebar'
      '. sidebar';
    grid-template-columns: 2fr 1fr;
    /* grid-template-rows: min-content min-content min-content; */
    column-gap: 0.75rem;
  }
  /* source: https://github.com/saadeghi/daisyui/issues/3040#issuecomment-2250530354 */
  :root:has(
      :global(:is(.modal-open, .modal:target, .modal-toggle:checked + .modal, .modal[open]))
    ) {
    scrollbar-gutter: unset;
  }
</style>

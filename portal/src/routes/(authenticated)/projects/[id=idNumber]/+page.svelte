<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { l10nMap, tryLocalizeName } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import ProjectActionMenu from '$lib/projects/components/ProjectActionMenu.svelte';
  import { byName } from '$lib/utils/sorting';
  import { getRelativeTime } from '$lib/utils/time';
  import type { PageData } from './$types';
  import { Authors, OwnerGroup, Reviewers, Settings } from './forms';
  import { AddProduct } from './modals';
  import ProductCard from './ProductCard.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let addProductModal: HTMLDialogElement | undefined = $state(undefined);
</script>

<div class="w-full max-w-6xl mx-auto relative">
  <!-- Header -->
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
      <!-- Details -->
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
      <!-- Product List Header -->
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
          endpoint="addProduct"
        />
      </div>
      <!-- Products List -->
      <div>
        {#if !data.project?.Products.length}
          {m.projectTable_noProducts()}
        {:else}
          {#each data.project.Products.toSorted( (a, b) => byName(a.ProductDefinition, b.ProductDefinition, getLocale()) ) as product}
            <ProductCard
              {product}
              project={data.project}
              actionEndpoint="productAction"
              deleteEndpoint="deleteProduct"
              updateEndpoint="updateProduct"
            />
          {/each}
        {/if}
        <div class="divider"></div>
      </div>
    </div>
    <!-- Settings -->
    <div class="settingsarea my-4">
      <Settings
        project={data.project}
        publicEndpoint="toggleVisibility"
        downloadEndpoint="toggleDownload"
      />
    </div>
    <!-- Sidebar Settings -->
    <div class="space-y-2 min-w-0 flex-auto sidebararea">
      <OwnerGroup
        project={data.project}
        users={data.possibleProjectOwners}
        groups={data.possibleGroups}
        orgName={data.organizations.find((o) => o.Id === data.project.Organization.Id)?.Name}
        endpoint="editOwnerGroup"
      />
      <Authors
        group={data.project.Group}
        projectAuthors={data.project.Authors}
        availableAuthors={data.authorsToAdd}
        formData={data.authorForm}
        createEndpoint="addAuthor"
        deleteEndpoint="deleteAuthor"
      />
      <Reviewers
        reviewers={data.project.Reviewers}
        formData={data.reviewerForm}
        createEndpoint="addReviewer"
        deleteEndpoint="deleteReviewer"
      />
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

<script lang="ts">
  import { parse } from 'devalue';
  import type { Readable } from 'svelte/store';
  import { source } from 'sveltekit-sse';
  import ProductCard from './ProductCard.svelte';
  import { Authors, OwnerGroup, Reviewers, Settings } from './forms';
  import { AddProduct } from './modals';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { l10nMap, tryLocalizeName } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { canClaimProject, canModifyProject } from '$lib/projects';
  import ProjectActionMenu from '$lib/projects/components/ProjectActionMenu.svelte';
  import type { ProjectDataSSE } from '$lib/projects/sse';
  import { byName } from '$lib/utils/sorting';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';

  const { data } = $props();

  let addProductModal: HTMLDialogElement | undefined = $state(undefined);
  let projectLocationCopied = $state(false);

  const currentPageUrl = page.url.pathname;
  let reconnectDelay = 1000;
  const projectDataSSE: Readable<ProjectDataSSE> = source(`${page.params.id}/sse`, {
    close({ connect }) {
      setTimeout(() => {
        if (currentPageUrl !== page.url.pathname) {
          // If the current page has changed, we don't want to reconnect.
          return;
        }
        console.log('Disconnected. Reconnecting...');
        connect();
        reconnectDelay = Math.min(reconnectDelay * 2, 30000); // Exponential backoff, max 30 seconds
      }, reconnectDelay);
    }
  })
    .select('projectData')
    .transform((t) => (t ? parse(t) : undefined));

  const projectData = $derived($projectDataSSE ?? data.projectData);
  const dateCreated = $derived(getRelativeTime(projectData?.project?.DateCreated ?? null));
  const dateArchived = $derived(getRelativeTime(projectData?.project?.DateArchived ?? null));

  const canEdit = $derived(
    canModifyProject(
      data.session.user,
      projectData?.project.OwnerId ?? -1,
      projectData?.project.OrganizationId ?? -1
    )
  );
  const canClaim = $derived(
    canClaimProject(
      data.session.user,
      projectData?.project.OwnerId ?? -1,
      projectData?.project.OrganizationId ?? -1,
      projectData?.project.GroupId ?? -1,
      projectData?.userGroups ?? []
    )
  );
</script>

<div class="w-full max-w-6xl mx-auto relative">
  {#if !projectData}
    <div class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <!-- Header -->
    <div class="flex p-6">
      <div class="shrink">
        <h1 class="p-0">
          {projectData.project?.Name}
        </h1>
        <div>
          <span class="font-bold">
            {projectData.project.IsPublic ? m.project_public() : m.project_private()}
          </span>
          <span>-</span>
          <span>
            {m.project_createdOn()}
            <Tooltip tip={getTimeDateString(projectData.project.DateCreated)}>
              {$dateCreated}
            </Tooltip>
          </span>
        </div>
        {#if projectData?.project?.DateArchived}
          <span>
            {m.project_archivedOn()}
            <Tooltip tip={getTimeDateString(projectData.project.DateArchived)}>
              {$dateArchived}
            </Tooltip>
          </span>
        {/if}
      </div>

      <div class="grow">
        {#if canEdit}
          <Tooltip class="tooltip-bottom" tip={m.project_editProject()}>
            <a
              href={localizeHref(`/projects/${projectData.project.Id}/edit`)}
              title={m.project_editProject()}
            >
              <IconContainer width="24" icon="mdi:pencil" />
            </a>
          </Tooltip>
        {/if}
      </div>
      {#if canEdit || canClaim}
        <div class="shrink">
          <ProjectActionMenu
            data={data.actionForm}
            project={projectData.project}
            userGroups={projectData.userGroups}
          />
        </div>
      {/if}
    </div>
    <div class="grid maingrid w-full p-4 pb-0">
      <div class="mainarea min-w-0">
        <!-- Details -->
        <h2 class="pl-0">{m.project_details_title()}</h2>
        <div>
          <div class="gridcont grid gap-x-6 gap-y-2">
            <div class="flex place-content-between">
              <span>
                <IconContainer icon="mdi:language" width={20} />
                {m.project_details_language()}:
              </span>
              <span>
                {projectData.project.Language} ({tryLocalizeName(
                  data.langtags,
                  l10nMap.value,
                  getLocale(),
                  projectData.project.Language ?? ''
                )})
              </span>
            </div>
            <div class="flex place-content-between">
              <span>{m.project_details_type()}:</span>
              <span>{projectData.project.ApplicationType.Description}</span>
            </div>
          </div>
          <div class="my-4">
            <span>{m.common_description()}:</span>
            <br />
            <p>{projectData.project.Description}</p>
          </div>
          <div>
            <span>{m.project_location()}:</span>
            <br />
            <div class="flex rounded-md text-nowrap bg-base-200 p-3 pt-2 mt-2">
              <IconContainer icon="solar:link-bold" width={20} class="opacity-80 mr-1" />
              <p>
                {projectData.project.RepositoryUrl?.substring(0, 5) ?? ''}
              </p>
              {#if !projectData.project.RepositoryUrl}
                <p class="italic">{m.project_location_placeholder()}</p>
              {:else}
                <p class="shrink overflow-hidden text-ellipsis">
                  {projectData.project.RepositoryUrl.split('/').slice(2, -1).join('/')}
                </p>
                <p class="grow pr-2">
                  /{projectData.project.RepositoryUrl.split('/').pop()}
                </p>
                <button
                  class="cursor-copy float-right"
                  onclick={() => {
                    navigator.clipboard.writeText(projectData.project.RepositoryUrl!);
                    projectLocationCopied = true;
                    setTimeout(() => {
                      projectLocationCopied = false;
                    }, 5000);
                  }}
                >
                  {#if projectLocationCopied}
                    <IconContainer icon="mdi:check" width={24} class="text-success" />
                  {:else}
                    <IconContainer icon="mdi:content-copy" width={24} />
                  {/if}
                </button>
              {/if}
            </div>
          </div>
        </div>
        <!-- Product List Header -->
        <div class="flex flex-row place-content-between items-end">
          <div>
            <h2 class="pl-0">{m.products_title()}</h2>
            <div class="mb-2">
              <span class="italic">{m.products_definition()}</span>
            </div>
          </div>
          <BlockIfJobsUnavailable class="btn btn-outline">
            {#snippet altContent()}
              <IconContainer icon="system-uicons:box-add" width={20} />
              {m.products_add()}
            {/snippet}
            <button
              class="btn btn-outline"
              onclick={() => addProductModal?.showModal()}
              disabled={!(
                canEdit &&
                projectData.productsToAdd.length &&
                projectData.project.RepositoryUrl
              )}
            >
              {@render altContent()}
            </button>
          </BlockIfJobsUnavailable>
          {#if canEdit}
            <AddProduct
              bind:modal={addProductModal}
              prodDefs={projectData.productsToAdd}
              stores={projectData.stores}
              endpoint="addProduct"
            />
          {/if}
        </div>
        <!-- Products List -->
        <div>
          {#if !projectData?.project?.Products.length}
            {m.projectTable_noProducts()}
          {:else}
            {#each projectData.project.Products.toSorted( (a, b) => byName(a.ProductDefinition, b.ProductDefinition, getLocale()) ) as product}
              <ProductCard
                {product}
                project={projectData.project}
                actionEndpoint="productAction"
                deleteEndpoint="deleteProduct"
                updateEndpoint="updateProduct"
                {canEdit}
              />
            {/each}
          {/if}
          <div class="divider"></div>
        </div>
      </div>
      <!-- Settings -->
      <div class="settingsarea my-4">
        <Settings
          project={projectData.project}
          {canEdit}
          showRebuildToggles={data.showRebuildToggles}
        />
      </div>
      <!-- Sidebar Settings -->
      <div class="space-y-2 min-w-0 flex-auto sidebararea">
        <OwnerGroup
          project={projectData.project}
          users={projectData.possibleProjectOwners}
          groups={projectData.possibleGroups}
          orgName={data.organizations.find((o) => o.Id === projectData.project.OrganizationId)
            ?.Name}
          endpoint="editOwnerGroup"
          {canEdit}
          {canClaim}
        />
        <Authors
          group={projectData.project.Group}
          projectAuthors={projectData.project.Authors}
          availableAuthors={projectData.authorsToAdd}
          formData={data.authorForm}
          createEndpoint="addAuthor"
          deleteEndpoint="deleteAuthor"
          {canEdit}
        />
        <Reviewers
          reviewers={projectData.project.Reviewers}
          formData={data.reviewerForm}
          createEndpoint="addReviewer"
          deleteEndpoint="deleteReviewer"
          {canEdit}
        />
      </div>
    </div>
  {/if}
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
</style>

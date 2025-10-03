<script lang="ts">
  import { onMount } from 'svelte';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData, RouteParams } from './$types';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref, localizeUrl } from '$lib/paraglide/runtime';
  import { RoleId } from '$lib/prisma';
  import type { ProjectForAction, PrunedProject } from '$lib/projects';
  import { canArchive, canClaimProject, canReactivate } from '$lib/projects';
  import ProjectActionMenu from '$lib/projects/components/ProjectActionMenu.svelte';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
  import { byName, byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let projects = $state(data.projects);
  let count = $state(data.count);

  const {
    form: pageForm,
    enhance: pageEnhance,
    submit: pageSubmit
  } = superForm(data.pageForm, {
    dataType: 'json',
    resetForm: false,
    invalidateAll: false,
    onChange(event) {
      if (
        !(
          event.paths.includes('langCode') ||
          event.paths.includes('search') ||
          // handle organization change solely through routing
          event.paths.includes('organizationId')
        )
      ) {
        pageSubmit();
      }
    },
    onUpdate(event) {
      const returnedData = event.result.data as FormResult<{
        query: { data: PrunedProject[]; count: number };
      }>;
      if (event.form.valid && returnedData.query) {
        projects = returnedData.query.data;
        count = returnedData.query.count;
      }
    }
  });

  const {
    form: actionForm,
    enhance: actionEnhance,
    submit: actionSubmit
  } = superForm(data.actionForm, {
    dataType: 'json',
    invalidateAll: false,
    onChange: (event) => {
      if (
        event.paths.includes('operation') &&
        $actionForm.operation &&
        $actionForm.projects.length
      ) {
        actionSubmit();
      }
      if (event.paths.includes('projects')) {
        $actionForm.projectId = null;
      }
    },
    onError: ({ result }) => {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    },
    onUpdated: ({ form }) => {
      if (form.data.operation === 'archive' || form.data.operation === 'reactivate') {
        pageSubmit();
      }
    }
  });

  type ProductForAction = {
    Id: string;
    ProductDefinitionId: number;
    ProductDefinitionName: string | null;
    CanRebuild: boolean;
    CanRepublish: boolean;
  };
  let selectedProjects: (ProjectForAction & { Products: ProductForAction[] })[] = $derived(
    projects.filter((p) => $actionForm.projects.includes(p.Id))
  );
  /** For selecting products for bulk rebuild/republish */
  let productSelectModal: HTMLDialogElement | undefined = $state(undefined);
  let selectedProducts: ProductForAction[] = $state([]);

  afterNavigate((navigation) => {
    // tried workaround with $effect: https://github.com/sveltejs/kit/issues/11116#issuecomment-2574727891
    // this way worked much better for our use case
    projects = data.projects;
    count = data.count;
  });

  onMount(() => {
    if (page.params.orgId && $orgActive !== parseInt(page.params.orgId)) {
      $orgActive = parseInt(page.params.orgId);
    }
  });

  $effect(() => {
    if ($orgActive) {
      goto(localizeUrl(`/projects/${page.params.filter}/${$orgActive}`));
    } else {
      goto(localizeUrl(`/projects/${page.params.filter}`));
    }
  });

  let canArchiveSelected = $derived(
    selectedProjects.every((p) => canArchive(p, data.session.user))
  );
  let canReactivateSelected = $derived(
    selectedProjects.every((p) => canReactivate(p, data.session.user))
  );

  const {
    form: productForm,
    enhance: productEnhance,
    submit: productSubmit
  } = superForm(data.productForm, {
    resetForm: false,
    invalidateAll: false,
    dataType: 'json',
    onChange(event) {
      if (event.paths.includes('operation')) {
        productSubmit();
        productSelectModal?.close();
      }
    },
    onError: ({ result }) => {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    }
  });
  $effect(() => {
    $productForm.products = selectedProducts.map((p) => p.Id);
  });

  const mobileSizing = 'w-full max-w-xs md:w-auto md:max-w-none';

  const allOrgIds = $derived(data.organizations.map((o) => o.Id));

  const canModifyProjects = $derived(
    isSuperAdmin(data.session.user.roles) ||
      ($orgActive ? [$orgActive] : allOrgIds).every(
        (orgId) =>
          isAdminForOrg(orgId, data.session?.user.roles) ||
          data.session?.user.roles.some(([o, r]) => r === RoleId.AppBuilder && o === orgId)
      )
  );
</script>

<div class="w-full max-w-6xl mx-auto relative px-2">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    method="POST"
    action="?/page"
    use:pageEnhance
    onkeydown={(event) => {
      if (event.key === 'Enter') pageSubmit();
    }}
  >
    <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
      <div class="inline-block">
        <ProjectFilterSelector filter={(page.params as RouteParams).filter} />
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center mx-4 gap-1 {mobileSizing}"
      >
        <Tooltip className="tooltip-bottom {mobileSizing}">
          <div class="tooltip-content text-left">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html m.directory_searchHelp()}
          </div>
          <SearchBar bind:value={$pageForm.search} requestSubmit={pageSubmit} />
        </Tooltip>
      </div>
    </div>
  </form>
  {#if canModifyProjects}
    <div class="w-full flex flex-row flex-wrap place-content-between gap-1 mt-4">
      <form
        class="flex flex-row flex-wrap {mobileSizing} gap-1 mx-4"
        method="POST"
        action="?/projectAction"
        use:actionEnhance
      >
        <input type="hidden" name="projectId" value={null} />
        {#if data.allowActions && (canArchiveSelected || !selectedProjects.length)}
          <BlockIfJobsUnavailable className="btn btn-outline {mobileSizing}">
            {#snippet altContent()}
              {m.common_archive()}
            {/snippet}
            <label
              class="btn btn-outline {mobileSizing}"
              class:btn-disabled={!(canArchiveSelected && selectedProjects.length)}
            >
              {@render altContent()}
              <input
                class="hidden"
                type="radio"
                bind:group={$actionForm.operation}
                value="archive"
                disabled={!(canArchiveSelected && selectedProjects.length)}
              />
            </label>
          </BlockIfJobsUnavailable>
        {/if}
        {#if data.allowReactivate && (canReactivateSelected || !selectedProjects.length)}
          <BlockIfJobsUnavailable className="btn btn-outline {mobileSizing}">
            {#snippet altContent()}
              {m.common_reactivate()}
            {/snippet}
            <label
              class="btn btn-outline {mobileSizing}"
              class:btn-disabled={!(canReactivateSelected && selectedProjects.length)}
            >
              {@render altContent()}
              <input
                class="hidden"
                type="radio"
                bind:group={$actionForm.operation}
                value="reactivate"
                disabled={!(canReactivateSelected && selectedProjects.length)}
              />
            </label>
          </BlockIfJobsUnavailable>
        {/if}
        {#if data.allowActions && (canArchiveSelected || !selectedProjects.length)}
          <BlockIfJobsUnavailable className="btn btn-outline {mobileSizing}">
            {#snippet altContent()}
              {m.common_rebuild()}
            {/snippet}
            <button
              type="button"
              class="btn btn-outline {mobileSizing}"
              disabled={!(canArchiveSelected && selectedProjects.length)}
              onclick={() => productSelectModal?.showModal()}
            >
              {@render altContent()}
            </button>
          </BlockIfJobsUnavailable>
        {/if}
      </form>
      <dialog bind:this={productSelectModal} class="modal">
        <form class="modal-box" action="?/productAction" method="POST" use:productEnhance>
          <div class="items-center text-center">
            <div class="flex flex-row">
              <h2 class="text-lg font-bold grow">{m.projects_bulk_buildModal_title()}</h2>
              <button
                class="btn btn-ghost"
                type="button"
                onclick={() => {
                  productSelectModal?.close();
                }}
              >
                <IconContainer icon="mdi:close" width={36} class="opacity-80" />
              </button>
            </div>
            <hr />
            <div class="flex flex-col pt-1 space-y-1">
              {#each selectedProjects.toSorted((a, b) => byName(a, b, getLocale())) as project}
                {@const products = project.Products?.filter((p) => p.CanRebuild || p.CanRepublish)}
                <div class="p-2">
                  <h3>{project.Name}</h3>
                  {#if products?.length}
                    {#each products.toSorted( (a, b) => byString(a.ProductDefinitionName, b.ProductDefinitionName, getLocale()) ) as product}
                      <label
                        class="flex flex-col border border-secondary rounded text-left cursor-pointer"
                      >
                        <div class="flex flex-row flex-wrap bg-neutral-300 p-2 w-full text-black">
                          <input
                            type="checkbox"
                            class="checkbox checkbox-info"
                            bind:group={selectedProducts}
                            value={product}
                          />
                          <IconContainer
                            icon={getIcon(product.ProductDefinitionName ?? '')}
                            width="24"
                          />
                          {product.ProductDefinitionName}
                          <div class="basis-full h-0"></div>
                          {#if product.CanRebuild}
                            <div class="badge badge-info">{m.products_acts_rebuild()}</div>
                          {/if}
                          {#if product.CanRepublish}
                            <div class="badge badge-info">{m.products_acts_republish()}</div>
                          {/if}
                        </div>
                        <p class="p-2 text-sm text-neutral-400">
                          {data.productDefinitions.find(
                            (pd) => pd.Id === product.ProductDefinitionId
                          )?.Description}
                        </p>
                      </label>
                    {/each}
                  {:else}
                    {m.errors_invalidProjectSelection()}
                  {/if}
                </div>
              {/each}
            </div>
          </div>
          <div class="flex flex-row justify-end gap-2">
            <button
              class="btn btn-secondary"
              type="reset"
              onclick={() => productSelectModal?.close()}
            >
              {m.common_cancel()}
            </button>
            <BlockIfJobsUnavailable className="btn btn-primary">
              {#snippet altContent()}
                {m.products_acts_rebuild()}
              {/snippet}
              <label
                class="btn btn-primary"
                class:btn-disabled={!(
                  selectedProducts.length && selectedProducts.every((p) => p.CanRebuild)
                )}
              >
                {@render altContent()}
                <input
                  type="radio"
                  class="hidden"
                  bind:group={$productForm.operation}
                  value="rebuild"
                  disabled={!(
                    selectedProducts.length && selectedProducts.every((p) => p.CanRebuild)
                  )}
                />
              </label>
            </BlockIfJobsUnavailable>
            <BlockIfJobsUnavailable className="btn btn-primary">
              {#snippet altContent()}
                {m.products_acts_republish()}
              {/snippet}
              <label
                class="btn btn-primary"
                class:btn-disabled={!(
                  selectedProducts.length && selectedProducts.every((p) => p.CanRepublish)
                )}
              >
                {@render altContent()}
                <input
                  type="radio"
                  class="hidden"
                  bind:group={$productForm.operation}
                  value="republish"
                  disabled={!(
                    selectedProducts.length && selectedProducts.every((p) => p.CanRepublish)
                  )}
                />
              </label>
            </BlockIfJobsUnavailable>
          </div>
        </form>
        <form method="dialog" class="modal-backdrop">
          <button>{m.common_close()}</button>
        </form>
      </dialog>
      <div class="flex flex-row flex-wrap gap-1 mx-4 {mobileSizing}">
        <BlockIfJobsUnavailable className="btn btn-outline {mobileSizing}">
          {#snippet altContent()}
            {m.projectImport_title()}
          {/snippet}
          <a
            class="btn btn-outline {mobileSizing}"
            href={localizeHref(`/projects/import/${$orgActive}`)}
          >
            {@render altContent()}
          </a>
        </BlockIfJobsUnavailable>
        <BlockIfJobsUnavailable className="btn btn-outline {mobileSizing}">
          {#snippet altContent()}
            {m.sidebar_addProject()}
          {/snippet}
          <a
            class="btn btn-outline {mobileSizing}"
            href={localizeHref(`/projects/new/${$orgActive}`)}
          >
            {@render altContent()}
          </a>
        </BlockIfJobsUnavailable>
      </div>
    </div>
  {/if}
  {#if projects.length > 0}
    {@const locale = getLocale()}
    <div class="w-full relative p-4">
      {#each projects.toSorted((a, b) => byName(a, b, locale)) as project}
        <ProjectCard {project}>
          {#snippet select()}
            {#if canModifyProjects}
              <input
                type="checkbox"
                class="mr-2 checkbox checkbox-accent"
                bind:group={$actionForm.projects}
                value={project.Id}
              />
            {/if}
          {/snippet}
          {#snippet actions()}
            {#if canModifyProjects || canClaimProject(data.session.user, project.OwnerId, project.OrganizationId, project.GroupId, data.userGroups)}
              <ProjectActionMenu
                data={data.actionForm}
                {project}
                allowActions={data.allowActions}
                allowReactivate={data.allowReactivate}
                userGroups={data.userGroups}
                onUpdated={(operation) => {
                  if (operation === 'archive' || operation === 'reactivate') {
                    pageSubmit();
                  }
                }}
              />
            {/if}
          {/snippet}
        </ProjectCard>
      {/each}
    </div>
  {:else}
    <p class="m-8">{m.projectTable_empty()}</p>
  {/if}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    method="POST"
    action="?/page"
    use:pageEnhance
    onkeydown={(event) => {
      if (event.key === 'Enter') pageSubmit();
    }}
  >
    <div class="w-full flex flex-row place-content-start p-4 space-between-4 flex-wrap gap-1">
      <Pagination bind:size={$pageForm.page.size} total={count} bind:page={$pageForm.page.page} />
    </div>
  </form>
</div>

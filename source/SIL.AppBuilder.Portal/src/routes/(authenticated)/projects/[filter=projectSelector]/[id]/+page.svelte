<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import OrganizationDropdown from '$lib/components/OrganizationDropdown.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import type { ProjectForAction, PrunedProject } from '$lib/projects';
  import { canArchive, canReactivate } from '$lib/projects';
  import ProjectActionMenu from '$lib/projects/components/ProjectActionMenu.svelte';
  import ProjectCard from '$lib/projects/components/ProjectCard.svelte';
  import ProjectFilterSelector from '$lib/projects/components/ProjectFilterSelector.svelte';
  import { byName, byString } from '$lib/utils/sorting';
  import type { FormResult } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

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
    invalidateAll: true,
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
  let productSelectModal: HTMLDialogElement | undefined;
  let selectedProducts: ProductForAction[] = $state([]);

  afterNavigate((navigation) => {
    // tried workaround with $effect: https://github.com/sveltejs/kit/issues/11116#issuecomment-2574727891
    // this way worked much better for our use case
    projects = data.projects;
    count = data.count;
    $pageForm.organizationId = data.pageForm.data.organizationId;
  });

  let canArchiveSelected = $derived(
    selectedProjects.every((p) => canArchive(p, page.data.session, parseInt(page.params.id)))
  );
  let canReactivateSelected = $derived(
    selectedProjects.every((p) => canReactivate(p, page.data.session, parseInt(page.params.id)))
  );

  const {
    form: productForm,
    enhance: productEnhance,
    submit: productSubmit
  } = superForm(data.productForm, {
    resetForm: false,
    invalidateAll: false,
    onChange(event) {
      if (event.paths.includes('operation')) {
        productSubmit();
        productSelectModal?.close();
      }
    }
  });
  $effect(() => {
    $productForm.products = selectedProducts.map((p) => p.Id);
  });

  const mobileSizing = 'w-full max-w-xs md:w-auto md:max-w-none';
</script>

<div class="w-full max-w-6xl mx-auto relative px-2">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    action="?/page"
    use:pageEnhance
    onkeydown={(event) => {
      if (event.key === 'Enter') pageSubmit();
    }}
  >
    <div class="flex flex-row place-content-between w-full pt-4 flex-wrap">
      <div class="inline-block">
        <ProjectFilterSelector />
      </div>
      <div
        class="flex flex-row flex-wrap md:flex-nowrap place-content-end items-center mx-4 gap-1 {mobileSizing}"
      >
        <OrganizationDropdown
          className={mobileSizing}
          organizations={data.organizations}
          bind:value={$pageForm.organizationId}
          onchange={() => goto($pageForm.organizationId + '')}
        />
        <SearchBar bind:value={$pageForm.search} className={mobileSizing} />
      </div>
    </div>
  </form>
  <div class="w-full flex flex-row flex-wrap place-content-between gap-1 mt-4">
    <form
      class="flex flex-row flex-wrap {mobileSizing} gap-1 mx-4"
      method="POST"
      action="?/projectAction"
      use:actionEnhance
    >
      <input type="hidden" name="projectId" value={null} />
      {#if data.allowActions && (canArchiveSelected || !selectedProjects.length)}
        <label
          class="btn btn-outline {mobileSizing}"
          class:btn-disabled={!(canArchiveSelected && selectedProjects.length)}
        >
          {m.common_archive()}
          <input
            class="hidden"
            type="radio"
            bind:group={$actionForm.operation}
            value="archive"
            disabled={!(canArchiveSelected && selectedProjects.length)}
          />
        </label>
      {/if}
      {#if data.allowReactivate && (canReactivateSelected || !selectedProjects.length)}
        <label
          class="btn btn-outline {mobileSizing}"
          class:btn-disabled={!(canReactivateSelected && selectedProjects.length)}
        >
          {m.common_reactivate()}
          <input
            class="hidden"
            type="radio"
            bind:group={$actionForm.operation}
            value="reactivate"
            disabled={!(canReactivateSelected && selectedProjects.length)}
          />
        </label>
      {/if}
      {#if data.allowActions && (canArchiveSelected || !selectedProjects.length)}
        <button
          type="button"
          class="btn btn-outline {mobileSizing}"
          disabled={!(canArchiveSelected && selectedProjects.length)}
          onclick={() => productSelectModal?.showModal()}
        >
          {m.common_rebuild()}
        </button>
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
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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
                          <div class="badge badge-info">{m.products_actions_rebuild()}</div>
                        {/if}
                        {#if product.CanRepublish}
                          <div class="badge badge-info">{m.products_actions_republish()}</div>
                        {/if}
                      </div>
                      <p class="p-2 text-sm text-neutral-400">
                        {data.productDefinitions.find((pd) => pd.Id === product.ProductDefinitionId)
                          ?.Description}
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
          <button class="btn btn-primary" type="reset" onclick={() => productSelectModal?.close()}>
            {m.common_cancel()}
          </button>
          <label
            class="btn btn-info"
            class:btn-disabled={!(
              selectedProducts.length && selectedProducts.every((p) => p.CanRebuild)
            )}
          >
            {m.products_actions_rebuild()}
            <input
              type="radio"
              class="hidden"
              bind:group={$productForm.operation}
              value="rebuild"
              disabled={!(selectedProducts.length && selectedProducts.every((p) => p.CanRebuild))}
            />
          </label>
          <label
            class="btn btn-info"
            class:btn-disabled={!(
              selectedProducts.length && selectedProducts.every((p) => p.CanRepublish)
            )}
          >
            {m.products_actions_republish()}
            <input
              type="radio"
              class="hidden"
              bind:group={$productForm.operation}
              value="republish"
              disabled={!(selectedProducts.length && selectedProducts.every((p) => p.CanRepublish))}
            />
          </label>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
    {#if page.params.filter === 'own'}
      <div class="flex flex-row flex-wrap gap-1 mx-4 {mobileSizing}">
        <a
          class="btn btn-outline {mobileSizing}"
          href="/projects/import/{$pageForm.organizationId}"
        >
          {m.project_importProjects()}
        </a>
        <a class="btn btn-outline {mobileSizing}" href="/projects/new/{$pageForm.organizationId}">
          {m.sidebar_addProject()}
        </a>
      </div>
    {/if}
  </div>
  {#if projects.length > 0}
    {@const locale = getLocale()}
    <div class="w-full relative p-4">
      {#each projects.toSorted((a, b) => byName(a, b, locale)) as project}
        <ProjectCard {project}>
          {#snippet select()}
            <input
              type="checkbox"
              class="mr-2 checkbox checkbox-accent"
              bind:group={$actionForm.projects}
              value={project.Id}
            />
          {/snippet}
          {#snippet actions()}
            <ProjectActionMenu
              data={data.actionForm}
              {project}
              allowActions={data.allowActions}
              allowReactivate={data.allowReactivate}
              userGroups={data.userGroups}
              orgId={parseInt(page.params.id)}
            />
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

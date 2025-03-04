<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { i18n } from '$lib/i18n';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import langtags from '$lib/langtags.json';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import ProductDetails from '$lib/products/components/ProductDetails.svelte';
  import ProjectActionMenu from '$lib/projects/components/ProjectActionMenu.svelte';
  import { getRelativeTime } from '$lib/timeUtils';
  import { sortByName } from '$lib/utils';
  import { RoleId } from 'sil.appbuilder.portal.common/prisma';
  import { ProductType } from 'sil.appbuilder.portal.common/workflow';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  const langtagmap = new Map(langtags.map((tag) => [tag.tag, /* tag.localname ?? */ tag.name]));

  export let data: PageData;

  const { form: authorForm, enhance: authorEnhance } = superForm(data.authorForm);
  const { form: reviewerForm, enhance: reviewerEnhance } = superForm(data.reviewerForm, {
    resetForm: true
  });
  const { enhance: authorDeleteEnhance } = superForm(data.deleteAuthorForm, {
    warnings: {
      duplicateId: false
    }
  });
  const { enhance: reviewerDeleteEnhance } = superForm(data.deleteReviewerForm, {
    warnings: {
      duplicateId: false
    }
  });
  const { enhance: addProductEnhance } = superForm(data.addProductForm);
  function openModal(id: string) {
    (window[('modal' + id) as any] as any).showModal();
  }
  let simpleSettingsFormTimeout: NodeJS.Timeout;
  let simpleSettingsForm: HTMLFormElement;
  function submitSimpleSettingsForm() {
    if (simpleSettingsFormTimeout) {
      clearTimeout(simpleSettingsFormTimeout);
    }
    simpleSettingsFormTimeout = setTimeout(() => {
      simpleSettingsForm.requestSubmit();
    }, 2000);
  }
  let ownerSettingsFormTimeout: NodeJS.Timeout;
  let ownerSettingsForm: HTMLFormElement;
  let ownerField: HTMLInputElement;
  let groupField: HTMLInputElement;
  function submitOwnerSettingsForm() {
    if (ownerSettingsFormTimeout) {
      clearTimeout(ownerSettingsFormTimeout);
    }
    ownerSettingsFormTimeout = setTimeout(() => {
      ownerSettingsForm.requestSubmit();
    }, 2000);
  }

  async function handleProductAction(productId: string, action: string) {
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('productAction', action);

      const response = await fetch(`${$page.url.pathname}?/productAction`, {
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

  let addProductModal: HTMLDialogElement | undefined;
  let selectingStore: boolean = false;
  let selectedProduct: number = 0;
  $: availableStores = data.stores.filter(
    (s) => s.StoreTypeId === data.productsToAdd[selectedProduct]?.Workflow.StoreTypeId
  );
</script>

<div class="w-full max-w-6xl mx-auto relative">
  <div class="flex p-6">
    <div class="shrink">
      <h1 class="p-0">
        {data.project?.Name}
      </h1>
      <span class="font-bold">
        {data.project?.IsPublic ? m.project_public() : m.project_private()}
      </span>
      <span>-</span>
      <span>
        {m.project_createdOn()}
        {data.project?.DateCreated ? getRelativeTime(data.project?.DateCreated) : 'null'}
      </span>
    </div>
    <div class="grow">
      <div class="tooltip tooltip-bottom" data-tip={m.project_editProject()}>
        <a href="/projects/{data.project?.Id}/edit" title={m.project_editProject()}>
          <IconContainer width="24" icon="mdi:pencil" />
        </a>
      </div>
    </div>
    <div class="shrink">
      <ProjectActionMenu
        data={data.actionForm}
        project={data.project}
        userGroups={data.userGroups}
      />
    </div>
  </div>
  <div class="grid maingrid w-full p-4 pb-0">
    <div class="mainarea min-w-0">
      <h2 class="pl-0">{m.project_details_title()}</h2>
      <div>
        <!-- TODO: I don't like how project visibility and allow downloads are shown. -->
        <!-- Probably needs new i18n entries -->
        <div class="gridcont grid gap-x-6 gap-y-2">
          <div class="flex place-content-between">
            <span>
              <IconContainer icon="ph:globe" width={20} />
              {m.project_details_language()}:
            </span>
            <span>{data.project?.Language} ({langtagmap.get(data.project.Language ?? '')})</span>
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
          on:click={() => addProductModal?.showModal()}
          disabled={!(data.productsToAdd.length && data.project.WorkflowProjectUrl)}
        >
          {m.project_products_add()}
        </button>
        <dialog bind:this={addProductModal} class="modal">
          <form class="modal-box" action="?/addProduct" method="POST" use:addProductEnhance>
            <div class="items-center text-center" class:hidden={selectingStore}>
              <div class="flex flex-row">
                <h2 class="text-lg font-bold grow">{m.project_products_popup_addTitle()}</h2>
                <button
                  class="btn btn-ghost"
                  type="button"
                  on:click={() => {
                    addProductModal?.close();
                  }}
                >
                  <IconContainer icon="mdi:close" width={36} class="opacity-80" />
                </button>
              </div>
              <hr />
              <div class="flex flex-col pt-1 space-y-1">
                {#each data.productsToAdd as productDef, i}
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                  <label
                    class="flex flex-col border border-secondary rounded text-left form-control cursor-pointer"
                    on:click={() => {
                      selectingStore = true;
                      selectedProduct = i;
                    }}
                  >
                    <div class="flex flex-row bg-neutral-300 p-2 w-full text-black">
                      <IconContainer icon={getIcon(productDef.Name ?? '')} width="24" />
                      {productDef.Name}
                    </div>
                    <p class="p-2 text-sm text-neutral-400">{productDef.Description}</p>
                    <input
                      type="radio"
                      name="productDefinitionId"
                      value={productDef.Id}
                      class="hidden"
                    />
                  </label>
                {/each}
              </div>
            </div>
            <div class="items-center text-center" class:hidden={!selectingStore}>
              <div class="flex flex-row">
                <h2 class="text-lg font-bold">
                  {m.products_storeSelect({
                    name: data.productsToAdd[selectedProduct]?.Name || ''
                  })}
                </h2>
                <button
                  class="btn btn-ghost"
                  type="button"
                  on:click={() => {
                    selectingStore = false;
                  }}
                >
                  <IconContainer icon="mdi:close" width={36} class="opacity-80" />
                </button>
              </div>
              <hr />
              <div class="flex flex-col pt-1 space-y-1">
                {#if availableStores.length}
                  {#each availableStores as store}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <label
                      class="flex flex-col border border-secondary rounded text-left form-control cursor-pointer"
                    >
                      <div class="flex flex-row bg-neutral-300 p-2 w-full text-black">
                        {store.Name}
                      </div>
                      <p class="p-2 text-sm text-neutral-400">{store.Description}</p>
                      <input
                        type="submit"
                        name="storeId"
                        value={store.Id}
                        class="hidden"
                        on:click={() => {
                          addProductModal?.close();
                          selectingStore = false;
                        }}
                      />
                    </label>
                  {/each}
                {:else}
                  {m.products_noStoresAvailable()}
                {/if}
              </div>
            </div>
          </form>
          <form method="dialog" class="modal-backdrop">
            <button on:click={() => (selectingStore = false)}>close</button>
          </form>
        </dialog>
      </div>
      <div>
        {#if !data.project?.Products.length}
          {m.projectTable_noProducts()}
        {:else}
          {@const langTag = languageTag()}
          {#each data.project.Products.sort( (a, b) => sortByName(a.ProductDefinition, b.ProductDefinition, langTag) ) as product}
            <div class="rounded-md border border-slate-400 w-full my-2">
              <div class="bg-neutral p-2 flex flex-row rounded-t-md">
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
                  {getRelativeTime(product.DateUpdated)}
                </span>
                <span class="w-32 inline-block">
                  {m.project_products_published()}
                  <br />
                  {getRelativeTime(product.DatePublished)}
                </span>
                <span>
                  <div role="button" class="dropdown" tabindex="0">
                    <div class="btn btn-ghost px-1">
                      <IconContainer icon="charm:menu-kebab" width="20" />
                    </div>
                    <div
                      class="dropdown-content bottom-12 right-0 p-1 bg-base-200 z-10 rounded-md min-w-36 w-auto shadow-lg"
                    >
                      <ul class="menu menu-compact overflow-hidden rounded-md">
                        {#each product.actions as action}
                          {@const message =
                            //@ts-expect-error this is in fact correct
                            m['products_actions_' + action]()}
                          <li class="w-full rounded-none">
                            <button
                              class="text-nowrap"
                              on:click={(event) => {
                                handleProductAction(product.Id, action);
                                event.currentTarget.blur();
                              }}
                            >
                              {message}
                            </button>
                          </li>
                        {/each}
                        <li class="w-full rounded-none">
                          <button class="text-nowrap" on:click={() => openModal(product.Id)}>
                            {m.project_products_popup_details()}
                          </button>
                        </li>
                        <li class="w-full rounded-none">
                          <a href="/products/{product.Id}/files" class="text-nowrap">
                            {m.project_productFiles()}
                          </a>
                        </li>
                        {#if data.session?.user.roles.find((role) => role[0] === data.project?.Organization.Id && role[1] === RoleId.OrgAdmin)}
                          <li class="w-full rounded-none">
                            <span class="text-nowrap">
                              <!-- TODO: figure out Publishing Properties -->
                              {m.project_products_popup_properties()}
                            </span>
                          </li>
                        {/if}
                        {#if data.session?.user.roles.find((role) => role[1] === RoleId.SuperAdmin) && !!product.WorkflowInstance}
                          <li class="w-full-rounded-none">
                            <a href="/workflow-instances/{product.Id}">
                              {m.common_workflow()}
                            </a>
                          </li>
                        {/if}
                        <li class=" w-full rounded-none">
                          <!-- TODO: Might want a confirmation modal -->
                          <label class="text-nowrap text-error">
                            {m.project_products_remove()}

                            <form action="?/deleteProduct" method="post" use:enhance>
                              <input type="hidden" name="productId" value={product.Id} />
                              <input type="submit" class="hidden" />
                            </form>
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </span>
              </div>
              {#if product.WorkflowInstance}
                <div class="p-2 flex gap-1">
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
                  {m.tasks_forNames({
                    allowedNames: product.ActiveTransition?.AllowedUserNames || m.appName(),
                    activityName: product.ActiveTransition?.InitialState ?? ''
                    // activityName appears to show up blank primarily at the very startup of a new product?
                  })}
                  {#if product.UserTasks.slice(-1)[0]?.UserId === $page.data.session?.user.userId}
                    <a class="link mx-2" href="/tasks/{product.Id}">
                      {m.common_continue()}
                    </a>
                  {/if}
                </div>
              {/if}
              <ProductDetails {product} />
            </div>
          {/each}
        {/if}
        <div class="divider" />
      </div>
    </div>
    <div class="settingsarea my-4">
      <h2 class="pl-0 pt-0">{m.project_settings_title()}</h2>
      <form
        action="?/editSettings"
        method="post"
        bind:this={simpleSettingsForm}
        use:enhance={() =>
          ({ update }) =>
            update({ reset: false })}
      >
        <div class="space-y-2">
          <label for="public" class="flex place-content-between">
            <div class="flex flex-col">
              <span class="">
                {m.project_settings_visibility_title()}
              </span>
              <span class="text-sm">
                {m.project_settings_visibility_description()}
              </span>
            </div>
            <input
              type="checkbox"
              id="public"
              name="isPublic"
              class="toggle toggle-accent ml-4"
              bind:checked={data.project.IsPublic}
              on:click={submitSimpleSettingsForm}
            />
          </label>
          <label for="allowDownload" class="flex place-content-between">
            <div class="flex flex-col">
              <span class="">
                {m.project_settings_organizationDownloads_title()}
              </span>
              <span class="text-sm">
                {m.project_settings_organizationDownloads_description()}
              </span>
            </div>
            <input
              type="checkbox"
              id="allowDownload"
              name="allowDownload"
              class="toggle toggle-accent ml-4"
              bind:checked={data.project.AllowDownloads}
              on:click={submitSimpleSettingsForm}
            />
          </label>
        </div>
      </form>
    </div>
    <div class="space-y-2 min-w-0 flex-auto sidebararea">
      <div class="bg-neutral card card-bordered border-slate-400 rounded-md max-w-full">
        <form
          action="?/editOwnerGroup"
          bind:this={ownerSettingsForm}
          method="post"
          use:enhance={() =>
            ({ update }) =>
              update({ reset: false })}
        >
          <div class="flex flex-col py-4">
            <div class="flex flex-col place-content-between px-4">
              <span class="items-center flex gap-x-1">
                <IconContainer icon="clarity:organization-solid" width="20" />
                {m.project_side_organization()}
              </span>
              <span class="text-right">
                {data.organizations.find((o) => data.project?.Organization.Id === o.Id)?.Name}
              </span>
            </div>
            <div class="divider my-2" />
            <div class="flex flex-col place-content-between px-4 pr-2">
              <span>
                <IconContainer icon="mdi:user" width="20" />
                {m.project_side_projectOwner()}
              </span>
              <span class="text-right flex place-content-end">
                <div class="dropdown" role="button" tabindex="0">
                  <div
                    class="btn btn-ghost p-0.5 h-auto min-h-0 no-animation flex-nowrap items-center font-normal"
                  >
                    <span class="flex items-center pl-1">
                      {data.project?.Owner.Name}
                      <IconContainer icon="gridicons:dropdown" width="20" />
                    </span>
                  </div>
                  <div
                    role="button"
                    tabindex="0"
                    class="dropdown-content arrow-top menu drop-shadow-lg bg-base-200 z-20 min-w-[10rem] top-8 right-0 rounded-md"
                  >
                    <input
                      type="hidden"
                      name="owner"
                      value={data.project.Owner.Id}
                      bind:this={ownerField}
                    />
                    <ul class="menu menu-compact overflow-hidden rounded-md">
                      {#each data.possibleProjectOwners.sort((a, b) => a.Name?.localeCompare(b.Name ?? '') ?? 0) as owner}
                        <li class="w-full rounded-none">
                          <button
                            class="text-nowrap"
                            class:font-bold={owner.Id === data.project.Owner.Id}
                            on:click={() => {
                              ownerField.value = owner.Id + '';
                              submitOwnerSettingsForm();
                            }}
                          >
                            {owner.Name}
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                </div>
              </span>
            </div>
            <div class="divider my-2" />
            <div class="flex flex-col place-content-between px-4 pr-2">
              <span class="grow text-nowrap">
                <IconContainer icon="mdi:account-group" width={20} />
                {m.project_side_projectGroup()}
              </span>
              <span class="shrink text-right flex place-content-end items-center">
                <div class="dropdown" role="button" tabindex="0">
                  <div
                    class="btn btn-ghost p-0.5 h-auto min-h-0 no-animation flex-nowrap items-center font-normal"
                  >
                    <span class="flex items-center pl-1">
                      {data.project?.Group.Name}
                      <IconContainer icon="gridicons:dropdown" width="20" />
                    </span>
                  </div>
                  <div
                    role="button"
                    tabindex="0"
                    class="dropdown-content arrow-top menu drop-shadow-lg bg-base-200 z-20 min-w-[10rem] top-8 right-0 rounded-md"
                  >
                    <input
                      type="hidden"
                      name="group"
                      value={data.project.Group.Id}
                      bind:this={groupField}
                    />
                    <ul class="menu menu-compact overflow-hidden rounded-md">
                      {#each data.possibleGroups.sort((a, b) => a.Name?.localeCompare(b.Name ?? '') ?? 0) as group}
                        <li class="w-full rounded-none">
                          <button
                            class="text-nowrap"
                            class:font-bold={group.Id === data.project.Group.Id}
                            on:click={() => {
                              groupField.value = group.Id + '';
                              submitOwnerSettingsForm();
                            }}
                          >
                            {group.Name}
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                </div>
              </span>
            </div>
          </div>
        </form>
      </div>

      <div class="card card-bordered border-slate-400 overflow-hidden rounded-md max-w-full">
        <div class="bg-neutral">
          <h2>{m.project_side_authors_title()}</h2>
        </div>
        <div class="p-2">
          {#if data.project?.Authors.length ?? 0 > 0}
            {#each data.project?.Authors ?? [] as author}
              <div class="flex flex-row w-full place-content-between p-2">
                <span>{author.Users.Name}</span>
                <form action="?/deleteAuthor" method="post" use:authorDeleteEnhance>
                  <input type="hidden" name="id" value={author.Id} />
                  <button type="submit">
                    <IconContainer icon="mdi:close" width="24" />
                  </button>
                </form>
              </div>
            {/each}
          {:else}
            <p class="p-2">{m.project_side_authors_empty()}</p>
          {/if}
        </div>
        <div class="bg-neutral p-2">
          <form action="?/addAuthor" method="post" use:authorEnhance>
            <div class="flex place-content-between space-x-2">
              <select
                class="grow select select-bordered"
                name="author"
                bind:value={$authorForm.author}
              >
                {#each data.authorsToAdd.filter((author) => !data.project?.Authors.some((au) => au.Users.Id === author.Id)) as author}
                  <option value={author.Id}>
                    {author.Name}
                  </option>
                {/each}
              </select>
              <button type="submit" class="btn btn-primary">
                {m.project_side_authors_form_submit()}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div class="card card-bordered border-slate-400 overflow-hidden rounded-md max-w-full">
        <div class="bg-neutral">
          <h2>{m.project_side_reviewers_title()}</h2>
        </div>
        <div class="p-2">
          {#if data.project?.Reviewers.length ?? 0 > 0}
            {#each data.project?.Reviewers ?? [] as reviewer}
              <div class="flex flex-row w-full place-content-between p-2">
                <span>{reviewer.Name} ({reviewer.Email})</span>
                <form action="?/deleteReviewer" method="post" use:reviewerDeleteEnhance>
                  <input type="hidden" name="id" value={reviewer.Id} />
                  <button type="submit">
                    <IconContainer icon="mdi:close" width="24" />
                  </button>
                </form>
              </div>
            {/each}
          {:else}
            <p class="p-2">{m.project_side_reviewers_empty()}</p>
          {/if}
        </div>
        <div class="p-2 bg-neutral">
          <form action="?/addReviewer" method="post" use:reviewerEnhance>
            <div class="flex flex-col place-content-between space-y-2">
              <div class="flex flex-col gap-2 reviewerform">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  class="input input-bordered grow"
                  bind:value={$reviewerForm.name}
                />
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  class="input input-bordered grow"
                  bind:value={$reviewerForm.email}
                />
              </div>
              <div class="flex flex-row space-x-2">
                <select
                  name="locale"
                  class="grow select select-bordered"
                  bind:value={$reviewerForm.language}
                >
                  {#each i18n.config.runtime.availableLanguageTags as tag}
                    <option value={tag}>{tag.split('-')[0]}</option>
                  {/each}
                </select>
                <button type="submit" class="btn btn-primary">
                  {m.project_side_reviewers_form_submit()}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @container (width > 450px) {
    .reviewerform {
      flex-direction: row;
    }
  }
  div.dropdown-content::after {
    content: '';
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    position: absolute;
    bottom: -5px;
    right: 10px;
    background-color: var(--fallback-b2, oklch(var(--b2) / var(--tw-bg-opacity)));
  }
  div.dropdown-content.arrow-top::after {
    bottom: auto;
    top: -5px;
  }
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
  :root:has(:is(.modal-open, .modal:target, .modal-toggle:checked + .modal, .modal[open])) {
    scrollbar-gutter: unset;
  }
</style>

<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { i18n } from '$lib/i18n';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import langtags from '$lib/langtags.json';
  import * as m from '$lib/paraglide/messages';
  import { getRelativeTime, getTimeDateString } from '$lib/timeUtils';
  import { ProductTransitionType, RoleId } from 'sil.appbuilder.portal.common/prisma';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  const langtagmap = new Map(langtags.map((tag) => [tag.tag, /* tag.localname ?? */ tag.name]));

  export let data: PageData;

  const { form: authorForm, enhance: authorEnhance } = superForm(data.authorForm);
  const { form: reviewerForm, enhance: reviewerEnhance } = superForm(data.reviewerForm, {
    resetForm: true
  });
  const { form: authorDeleteForm, enhance: authorDeleteEnhance } = superForm(
    data.deleteAuthorForm,
    {
      warnings: {
        duplicateId: false
      }
    }
  );
  const { form: reviewerDeleteForm, enhance: reviewerDeleteEnhance } = superForm(
    data.deleteReviewerForm,
    {
      warnings: {
        duplicateId: false
      }
    }
  );
  function openModal(id: string) {
    (window[('modal' + id) as any] as any).showModal();
  }
  function stateString(workflowTypeNum: number, transitionType: number) {
    const workflowType = (
      m[
        ('admin_settings_workflowDefinitions_workflowTypes_' + workflowTypeNum) as keyof typeof m
      ] as any
    )();
    switch (transitionType) {
      case 2:
        return m.project_products_transitions_transitionTypes_2({
          workflowType
        });
      case 3:
        return m.project_products_transitions_transitionTypes_3({
          workflowType
        });
      case 4:
        return m.project_products_transitions_transitionTypes_4({
          workflowType
        });
    }
    return '';
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
</script>

<div class="w-full max-w-6xl mx-auto relative">
  <a href="/projects/{data.project?.Id}/edit" class="btn btn-primary absolute right-4 top-20">
    {m.project_editProject()}
  </a>
  <h1 class="pl-6">{data.project?.Name}</h1>
  <span class="ml-4 font-bold">
    {data.project?.IsPublic ? m.project_public() : m.project_private()}
  </span>
  <span>-</span>
  <span>
    {m.project_createdOn()}
    {data.project?.DateCreated ? getRelativeTime(data.project?.DateCreated) : 'null'}
  </span>
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
        <div>
          <span>{m.project_side_repositoryLocation()}:</span>
          <br />
          <p class="rounded-md text-nowrap overflow-x-scroll bg-base-200 p-3 pt-2 mt-2">
            {data.project?.WorkflowProjectUrl}
          </p>
        </div>
      </div>
      <div class="flex flex-row place-content-between items-end">
        <div>
          <h2 class="pl-0">{m.project_products_title()}</h2>
          <div class="mb-2">
            <span class="italic">{m.products_definition()}</span>
          </div>
        </div>
        <button class="btn btn-outline" on:click={() => alert('TODO api proxy')}>
          {m.project_products_add()}
        </button>
      </div>
      <div>
        {#if !data.project?.Products.length}
          {m.projectTable_noProducts()}
        {:else}
          {#each data.project.Products as product}
            <div class="rounded-md border border-slate-400 w-full my-2">
              <div class="bg-base-300 p-2 flex flex-row rounded-t-md">
                <span class="grow min-w-0">
                  <IconContainer icon={getIcon(product.ProductDefinition.Name ?? '')} width="32" />
                  {product.ProductDefinition.Name}
                </span>
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
                  <!-- TODO: also need any actions given by api? -->
                  <div role="button" class="dropdown" tabindex="0">
                    <div class="btn btn-ghost px-1">
                      <IconContainer icon="charm:menu-kebab" width="20" />
                    </div>
                    <div
                      class="dropdown-content bottom-12 right-0 p-1 bg-base-200 z-10 rounded-md min-w-36 w-auto shadow-lg"
                    >
                      <ul class="menu menu-compact overflow-hidden rounded-md">
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
                        {#if data.session?.user.roles.find((role) => role[0] === data.project?.OrganizationId && role[1] === RoleId.OrgAdmin)}
                          <li class="w-full rounded-none">
                            <span class="text-nowrap">
                              <!-- TODO: what is this -->
                              {m.project_products_popup_properties()}
                            </span>
                          </li>
                        {/if}
                        {#if data.session?.user.roles.find((role) => role[1] === RoleId.SuperAdmin)}
                          <li class="w-full-rounded-none">
                            <a href="/admin/settings/workflow-instances/{product.Id}">{m.common_workflow()}</a>
                          </li>
                        {/if}
                        <li class=" w-full rounded-none">
                          <!-- Might want a confirmation modal -->
                          <form action="?/deleteProduct" method="post" use:enhance>
                            <input type="hidden" name="id" value={product.Id} />
                            <button type="submit" class="text-nowrap text-error">
                              {m.project_products_remove()}
                            </button>
                          </form>
                        </li>
                      </ul>
                    </div>
                  </div>
                </span>
              </div>
              <div class="p-2 flex place-content-between">
                {m.tasks_waiting({
                  // waiting since EITHER (the last task exists) -> that task's creation time
                  // OR (there are no tasks for this product) -> the last completed transition's completion time
                  waitTime: getRelativeTime(
                    product.UserTasks.slice(-1)[0]?.DateCreated ??
                      product.PreviousTransition?.DateTransition ??
                      null
                  )
                })}
                {m.tasks_forNames({
                  allowedNames: product.ActiveTransition?.AllowedUserNames ?? 'Scriptoria',
                  activityName: product.ActiveTransition?.InitialState ?? ''
                })}
                {#if product.UserTasks.slice(-1)[0]?.UserId === $page.data.session?.user.userId}
                  <a class="link mx-2" href="/tasks/{product.Id}">
                    {m.common_continue()}
                  </a>
                {/if}
              </div>
              <dialog id="modal{product.Id}" class="modal">
                <div class="modal-box w-11/12 max-w-6xl">
                  <h2>{m.project_products_transitions_productDetails()}</h2>
                  <table class="table">
                    <thead>
                      <tr>
                        <th>{m.project_products_transitions_storeName()}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {product.Store?.Description}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="table">
                    <thead>
                      <tr>
                        <th>{m.project_products_transitions_state()}</th>
                        <th>{m.project_products_transitions_user()}</th>
                        <th>{m.project_products_transitions_command()}</th>
                        <th>{m.project_products_transitions_comment()}</th>
                        <th>{m.project_products_transitions_date()}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each product.Transitions as transition}
                        <tr class:font-bold={[2, 3, 4].includes(transition.TransitionType)}>
                          <td>
                            {#if transition.TransitionType === ProductTransitionType.Activity}
                              {transition.InitialState}
                            {:else if transition.TransitionType === ProductTransitionType.ProjectAccess}
                              * {transition.InitialState}
                            {:else}
                              {stateString(transition.WorkflowType ?? 1, transition.TransitionType)}
                            {/if}
                          </td>
                          <td>
                            <!-- Does not include WorkflowUserId mapping. Might be needed but didn't seem like it to me -->
                            {#if ![2, 3, 4].includes(transition.TransitionType)}
                              {transition.AllowedUserNames || m.appName()}
                            {/if}
                            <!-- TODO: handle username for Project Access transition types -->
                          </td>
                          <td>{transition.Command ?? ''}</td>
                          <td>
                            {#if transition.Comment?.startsWith('system.')}
                              {#if transition.Comment.startsWith('system.build-failed')}
                                <span>
                                  {m.system_buildFailed()}
                                </span>
                              {:else if transition.Comment.startsWith('system.publish-failed')}
                                <span>
                                  {m.system_publishFailed()}
                                </span>
                              {/if}
                              <br />
                              <a href={transition.Comment.replace('system.build-failed,', '')}>
                                {m.project_products_publications_console()}
                              </a>
                            {:else}
                              {transition.Comment ?? ''}
                            {/if}
                          </td>
                          <td>
                            {getTimeDateString(transition.DateTransition)}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
                <form method="dialog" class="modal-backdrop">
                  <button>close</button>
                </form>
              </dialog>
            </div>
          {/each}
        {/if}
        <div class="divider" />
      </div>
    </div>
    <div class="settingsarea my-4">
      <h2 class="pl-0 pt-0">Settings</h2>
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
              class="toggle toggle-info ml-4"
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
              class="toggle toggle-info ml-4"
              bind:checked={data.project.AllowDownloads}
              on:click={submitSimpleSettingsForm}
            />
          </label>
        </div>
      </form>
    </div>
    <div class="space-y-2 min-w-0 flex-auto sidebararea">
      <div class="bg-base-300 card card-bordered border-slate-400 rounded-md max-w-full">
        <form
          action="?/editOwnerGroup"
          bind:this={ownerSettingsForm}
          method="post"
          use:enhance={() =>
            ({ update }) =>
              update({ reset: false })}
        >
          <!-- TODO: i18n -->
          <h2>Settings</h2>
          <div class="flex flex-col py-4">
            <div class="flex flex-col place-content-between px-4">
              <span class="items-center flex gap-x-1">
                <IconContainer icon="clarity:organization-solid" width="20" />
                {m.project_side_organization()}
                <IconContainer
                  icon="mdi:lock"
                  width="16"
                  class="text-slate-400"
                  tooltip="Organization cannot be changed"
                />
              </span>
              <span class="text-right">
                {data.organizations.find((o) => data.project?.OrganizationId === o.Id)?.Name}
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
                      value={data.project.OwnerId}
                      bind:this={ownerField}
                    />
                    <ul class="menu menu-compact overflow-hidden rounded-md">
                      {#each data.possibleProjectOwners as owner}
                        <li class="w-full rounded-none">
                          <button
                            class="text-nowrap"
                            class:font-bold={owner.Id === data.project.OwnerId}
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
                      {data.project?.Group.Abbreviation}
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
                      value={data.project.GroupId}
                      bind:this={groupField}
                    />
                    <ul class="menu menu-compact overflow-hidden rounded-md">
                      {#each data.possibleGroups as group}
                        <li class="w-full rounded-none">
                          <button
                            class="text-nowrap"
                            class:font-bold={group.Id === data.project.GroupId}
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
        <div class="bg-base-300">
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
            <p class="p-2">No authors</p>
          {/if}
        </div>
        <div class="bg-base-300 p-2">
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
        <div class="bg-base-300">
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
            <!-- TODO i18n -->
            <p class="p-2">No reviewers</p>
          {/if}
        </div>
        <div class="p-2 bg-base-300">
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
</style>

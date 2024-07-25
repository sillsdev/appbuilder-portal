<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { i18n } from '$lib/i18n';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import { RoleId } from '$lib/prisma';
  import { getRelativeTime } from '$lib/timeUtils';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form: authorForm, enhance: authorEnhance } = superForm(data.authorForm);
  const { form: reviewerForm, enhance: reviewerEnhance } = superForm(data.reviewerForm);
</script>

<!-- TODO: add allow default and visibility details -->
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
  <div class="flex gap-x-2 gap-y-4 flex-row w-full p-4 flex-wrap">
    <div class="grow min-w-0">
      <h2 class="pl-0">{m.project_details_title()}</h2>
      <div>
        <div class="flex flex-row w-full mb-4 flex-wrap place-content-between">
          <table>
            <tbody>
              <tr>
                <td>
                  <span>
                    {m.project_side_organization()}:
                  </span>
                </td>
                <td>
                  {data.organizations.find((o) => data.project?.OrganizationId === o.Id)?.Name}
                </td>
              </tr>
              <tr>
                <td>
                  <span>
                    {m.project_side_projectOwner()}:
                  </span>
                </td>
                <td>{data.project?.Owner.Name}</td>
              </tr>
              <tr>
                <td>
                  <span>
                    {m.project_side_projectGroup()}:
                  </span>
                </td>
                <td>{data.project?.Group.Name}</td>
              </tr>
            </tbody>
          </table>
          <table>
            <tbody>
              <tr>
                <td>
                  <span>
                    {m.project_details_language()}:
                  </span>
                </td>
                <td>
                  {data.project?.Language}
                </td>
              </tr>
              <tr>
                <td>
                  {m.project_details_type()}:
                </td>
                <td>
                  {data.project?.ApplicationType.Description}
                </td>
              </tr>
            </tbody>
          </table>
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
        <button class="btn btn-outline">{m.project_products_add()}</button>
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
                  <!-- TODO: also need any actions given by api -->
                  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                  <div class="dropdown" tabindex="0">
                    <div class="btn btn-ghost px-1">
                      <IconContainer icon="charm:menu-kebab" width="20" />
                    </div>
                    <div
                      class="dropdown-content bottom-12 right-0 p-1 bg-base-200 z-10 rounded-md min-w-36 w-auto shadow-lg"
                    >
                      <ul class="menu menu-compact overflow-hidden rounded-md">
                        <li class="w-full rounded-none">
                          <span class="text-nowrap">
                            {m.project_products_popup_details()}
                          </span>
                        </li>
                        <li class="w-full rounded-none">
                          <span class="text-nowrap">
                            {m.project_productFiles()}
                          </span>
                        </li>
                        {#if data.session?.user.roles.find((role) => role[0] === data.project?.OrganizationId && role[1] === RoleId.OrgAdmin)}
                          <li class="w-full rounded-none">
                            <span class="text-nowrap">
                              {m.project_products_popup_properties()}
                            </span>
                          </li>
                        {/if}
                        <li class=" w-full rounded-none">
                          <span class="text-nowrap text-error">
                            {m.project_products_remove()}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </span>
              </div>
              <!-- TODO -->
              <!-- Need continue link if owned by current user -->
              <!-- Need workflow link if superadmin -->
              <div class="p-2">Waiting!!!</div>
            </div>
          {/each}
        {/if}
        <div class="flex flex-row space-x-2">
          <!-- Use a hamburger menu option instead -->
          <!-- <button class="btn btn-outline">{m.project_products_remove()}</button> -->
        </div>
      </div>
    </div>
    <div class="space-y-2 min-w-0 flex-auto">
      <div class="card card-bordered border-slate-400 overflow-hidden rounded-md max-w-full">
        <div class="bg-base-300">
          <h2>{m.project_side_authors_title()}</h2>
        </div>
        <div class="p-2">
          {#if data.project?.Authors.length ?? 0 > 0}
            {#each data.project?.Authors ?? [] as author}
              <div class="flex flex-row w-full place-content-between p-2">
                <span>{author.Users.Name}</span>
                <!-- TODO: remove author -->
                <IconContainer icon="mdi:close" width="24" />
              </div>
            {/each}
          {:else}
            <p class="p-2">No authors</p>
          {/if}
        </div>
        <div class="bg-base-300 p-2">
          <form action="?/addAuthor" method="post" use:authorEnhance>
            <div class="flex place-content-between space-x-2">
              <select class="grow select select-bordered" name="author">
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
                <span>{reviewer.Name}</span>
                <!-- TODO: remove author -->
                <IconContainer icon="mdi:close" width="24" />
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
                />
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  class="input input-bordered grow"
                />
              </div>
              <div class="flex flex-row space-x-2">
                <select name="locale" class="grow select select-bordered">
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
  tr td:first-child {
    padding-right: 0.3em;
  }
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
</style>

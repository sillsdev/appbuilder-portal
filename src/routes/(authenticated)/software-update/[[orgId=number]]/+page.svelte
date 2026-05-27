<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { parse } from 'devalue';
  import type { Readable } from 'svelte/store';
  import { source } from 'sveltekit-sse';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons, getActionIcon, getAppIcon, getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import type { ApplicationType } from '$lib/prisma';
  import { ProductActionType } from '$lib/products';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import type { RebuildItem, RebuildsTable } from '$lib/software-updates';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { isAdminForOrg } from '$lib/utils/roles';
  import { byName, byString } from '$lib/utils/sorting';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    data: PageData;
  }
  let { data }: Props = $props();

  const currentPageUrl = page.url.pathname;
  let reconnectDelay = 1000;
  const softwareUpdatesSSE: Readable<RebuildsTable> = $derived.by(() => {
    return source(`${page.url.pathname}/sse`, {
      close({ connect }) {
        setTimeout(() => {
          // If the current page has changed, we don't want to reconnect.
          if (currentPageUrl !== page.url.pathname) {
            return;
          }
          console.log('Disconnected. Reconnecting...');
          connect();
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        }, reconnectDelay);
      }
    })
      .select('rebuilds')
      .transform((t) => (t ? parse(t) : undefined));
  });

  // Use SSE data if available, otherwise fall back to server data
  const rebuilds: RebuildsTable = $derived($softwareUpdatesSSE ?? data.rebuilds);

  //const rebuilds = $derived(data.rebuilds);
  const { form, enhance } = superForm(data.form, {
    resetForm: true,
    onUpdate({ form, result, formElement }) {
      if (form.valid && result.type === 'success') {
        toast('success', m.softwareUpdate_toast_success());
        formElement.reset();
      }
    },
    onError({ result }) {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      } else {
        console.log('Unspecified error');
      }
    }
  });

  let applicationTypeIds = $state(
    data.applicationTypes.map(({ Id }) => Id).filter((i) => data.presentAppTypes.has(i))
  );

  afterNavigate(() => {
    // reset application type selection to default after navigating
    applicationTypeIds = data.applicationTypes
      .map(({ Id }) => Id)
      .filter((i) => data.presentAppTypes.has(i));
  });

  const locale = $derived(getLocale());

  const filteredOrgs = $derived(
    data.organizations
      .map((o) => {
        const presentAppTypes = new Set<number>();
        const filtered = {
          ...o,
          Projects: o.Projects.filter((p) => {
            const present = applicationTypeIds.includes(p.TypeId);
            if (present) {
              presentAppTypes.add(p.TypeId);
            }
            return present;
          }).sort((a, b) => byName(a, b, locale)),
          Versions:
            o.Versions?.filter((v) => presentAppTypes.has(v.ApplicationTypeId))
              .map((v) => ({
                Type: v.ApplicationTypeId,
                Versions: [v.Version],
                Name: data.applicationTypes.find((at) => at.Id === v.ApplicationTypeId)?.Description
              }))
              .sort((a, b) => byName(a, b, locale)) ?? []
        };

        return filtered;
      })
      .filter((o) => o.Projects.length)
      .sort((a, b) => byName(a, b, locale))
  );

  const filteredProjects = $derived(filteredOrgs.flatMap((o) => o.Projects));

  const products = $derived(filteredProjects.flatMap((p) => p.Products.map((p) => p.Id)));

  const allVersions = $derived(
    applicationTypeIds
      .map((id) => ({
        Type: id,
        Versions: Array.from(
          new Set(
            filteredProjects
              .filter((p) => p.TypeId === id)
              .flatMap((p) => p.Products.map((p) => p.NewVersion))
          )
        ),
        Name: data.applicationTypes.find((at) => at.Id === id)?.Description
      }))
      .sort((a, b) => byName(a, b, locale))
  );

  // Switch orgs properly
  $effect(() => {
    if (
      !selectGotoFromOrg(
        !!$orgActive && isAdminForOrg($orgActive, data.session.user.roles),
        `/software-update/${$orgActive}`,
        `/software-update`
      )
    ) {
      setOrgFromParams($orgActive, page.params.orgId);
    }
  });
</script>

{#snippet versions(args: { list: (typeof filteredOrgs)[number]['Versions']; classes?: string })}
  <ul class={args.classes ?? ''}>
    {#each args.list as version}
      <li class="flex flex-row gap-x-1">
        <img src={getAppIcon(version.Type)} width={20} alt="" />
        {version.Name}
        ({version.Versions.join(', ')})
      </li>
    {/each}
  </ul>
{/snippet}

<div class="w-full px-2 pb-1">
  <h1>{m.softwareUpdate()}</h1>
  <p class="pl-8 mt-2 mb-6">{m.softwareUpdate_description()}</p>
  <div class="w-full m-auto md:max-w-3xl">
    <form class="mx-4 flex flex-col" method="post" action="?/start" use:enhance>
      <input type="hidden" name="products" value={products} />

      <div class="flex flex-col md:flex-row">
        <!-- Application Type Toggles -->
        <div class="grow min-w-xs mb-2">
          <h3 class="font-semibold mb-2 pl-0">{m.softwareUpdate_application_types_title()}</h3>
          <p class="text-sm text-gray-500 mb-4">
            {m.softwareUpdate_application_types_description()}
          </p>

          <div class="flex w-full">
            <div class="shrink space-y-2">
              {#each data.applicationTypes.toSorted( (a, b) => byString(a.Description, b.Description, locale) ) as appType}
                <div
                  class={[
                    'flex space-x-2 items-center',
                    data.presentAppTypes.has(appType.Id) ||
                      'opacity-70 cursor-not-allowed select-none'
                  ]}
                >
                  <input
                    type="checkbox"
                    name="applicationTypeIds"
                    value={appType.Id}
                    bind:group={applicationTypeIds}
                    class="toggle toggle-accent toggle-sm"
                    disabled={!data.presentAppTypes.has(appType.Id)}
                  />
                  <img src={getAppIcon(appType.Id as ApplicationType)} width={24} alt="" />
                  <div class="font-medium">{appType.Description ?? ''}</div>
                </div>
              {/each}
            </div>
            <div class="grow"></div>
          </div>
        </div>
        <LabeledFormInput key="softwareUpdate_comment" class="md:mt-12">
          <textarea
            name="comment"
            class="textarea w-full validator min-h-42"
            bind:value={$form.comment}
            required
          ></textarea>
          <span class="validator-hint">{m.softwareUpdate_comment_required()}</span>
        </LabeledFormInput>
      </div>
      <!-- Summary Information -->
      <DataDisplayBox
        title={m.softwareUpdate_summary_title()}
        fields={[
          {
            key: 'softwareUpdate_initiated_by',
            value: data.user.Name
          },
          {
            key: 'common_projects',
            value: filteredProjects.length,
            faint: !filteredProjects.length
          },
          {
            key: 'products_title',
            value: products.length,
            faint: !products.length
          },
          {
            key: 'softwareUpdate_target_versions_label',
            snippet: versions,
            args: { list: allVersions, classes: 'indent-0' },
            faint: !allVersions.length
          }
        ]}
      >
        {#if $form.comment}
          <div class="text-sm opacity-75 pt-1">
            <TaskComment comment={$form.comment} />
          </div>
        {/if}
        <details
          class={[
            'collapse',
            filteredOrgs.length ? 'collapse-arrow' : 'opacity-40 pointer-events-none'
          ]}
        >
          <summary class="collapse-title font-bold pl-0 py-1">
            {#if filteredOrgs.length}
              {m.org_title()}
              ({filteredOrgs.length})
            {/if}
          </summary>
          <div class="collapse-content flex flex-col gap-y-2 px-0">
            {#each filteredOrgs as org}
              <DataDisplayBox
                class="border-base-content/25! m-0!"
                title={org.Name}
                fields={[
                  {
                    key: 'softwareUpdate_target_versions_label',
                    snippet: versions,
                    args: { list: org.Versions, classes: 'pl-2 indent-0' }
                  }
                ]}
              >
                <details class="collapse collapse-arrow rounded-none">
                  <summary class="collapse-title font-semibold pl-0 py-0">
                    {m.common_projects()} ({org.Projects.length})
                  </summary>
                  <div class="collapse-content flex flex-col gap-y-2 p-0!">
                    {#each org.Projects as project}
                      <DataDisplayBox
                        class="border-base-content/25! m-0!"
                        fields={[
                          {
                            key: 'softwareUpdate_target_versions_label',
                            value: Array.from(
                              new Set(project.Products.map((p) => p.NewVersion))
                            ).join(', ')
                          }
                        ]}
                      >
                        {#snippet title()}
                          <a
                            href={localizeHref(`/projects/${project.Id}`)}
                            class="link flex flex-row gap-x-1"
                          >
                            {project.Name}
                            <img src={getAppIcon(project.TypeId)} width={20} alt="" />
                          </a>
                        {/snippet}
                        <details class="collapse collapse-arrow rounded-none">
                          <summary class="collapse-title font-semibold pl-0 py-0">
                            {m.products_title()} ({project.Products.length})
                          </summary>
                          <div class="collapse-content p-0!">
                            <ul>
                              {#each project.Products.toSorted( (a, b) => byName(data.productTypes.get(a.Type), data.productTypes.get(b.Type), locale) ) as product}
                                {@const pd = data.productTypes.get(product.Type)}
                                <li>
                                  <IconContainer
                                    icon={getProductIcon(pd?.Workflow.ProductType ?? 0)}
                                    width={30}
                                  />
                                  <a
                                    class="hover:underline"
                                    href={localizeHref(`/projects/${project.Id}#${product.Id}`)}
                                  >
                                    {pd?.Name}
                                  </a>
                                  <s>{product.OldVersion}</s>
                                  &rarr; {product.NewVersion}
                                </li>
                              {/each}
                            </ul>
                          </div>
                        </details>
                      </DataDisplayBox>
                    {/each}
                  </div>
                </details>
              </DataDisplayBox>
            {/each}
          </div>
        </details>
      </DataDisplayBox>
      <SubmitButton
        class="mt-6"
        key="softwareUpdate_rebuild_start"
        icon={Icons.UpdateOn}
        disabled={applicationTypeIds.length === 0 || products.length === 0}
      />
    </form>

    <!-- Rebuilds List -->
    <div class="m-4">
      <div class="space-y-6">
        {#if rebuilds.incomplete.length > 0}
          <h1>{m.softwareUpdate_active_rebuilds_title()}</h1>
          {#each rebuilds.incomplete as rebuild}
            <div class="mb-4">{@render rebuildCard(rebuild)}</div>
          {/each}
        {/if}

        {#if rebuilds.complete.length > 0}
          <h1 class="mt-8">{m.softwareUpdate_completed_rebuilds_title()}</h1>
          {#each rebuilds.complete as rebuild}
            <div class="mb-4">{@render rebuildCard(rebuild)}</div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

{#snippet projects(
  list: Prisma.ProjectsGetPayload<{
    select: { Id: true; Name: true; TypeId: true };
  }>[] = filteredProjects
)}
  <span class="indent-0 inline-flex flex-row flex-wrap gap-1">
    {#each list as project}
      <a
        href={localizeHref(`/projects/${project.Id}`)}
        class="badge badge-primary badge-lg hover:badge-accent transition-colors"
      >
        {project.Name}
        <img src={getAppIcon(project.TypeId)} width={20} alt="" />
      </a>
    {/each}
  </span>
{/snippet}

{#snippet rebuildCard(rebuild: RebuildItem)}
  <div class="rounded-md bg-neutral border border-slate-400 my-6 overflow-hidden w-full">
    <div class="p-4 pb-2 w-full">
      <div class="flex flex-wrap justify-between p-2">
        <div class="mr-2">
          <span
            class="flex items-center mb-1"
            title={m.softwareUpdate_organizations({ amount: rebuild.Organizations.length })}
          >
            <IconContainer icon={Icons.Organization} width={20} class="mr-1 shrink-0" />
            {rebuild.Organizations.join(',') ?? ''}
          </span>
          <span class="flex items-center mb-1" title={m.softwareUpdate_initiated_by()}>
            <IconContainer icon={Icons.User} width={20} class="mr-1 shrink-0" />
            {rebuild.InitiatedBy ?? ''}
          </span>
          <span class="flex items-center mb-1">
            <IconContainer icon={Icons.Package} width={20} class="mr-1 shrink-0" />
            <span class="font-semibold mr-1">
              {m.softwareUpdate_products({ amount: rebuild._count.Products })}:
            </span>
          </span>
          <span class="flex items-center mb-1">
            <IconContainer icon={Icons.Directory} width={20} class="mr-1 shrink-0" />
            <span class="font-semibold mr-1">
              {m.softwareUpdate_projects({ amount: rebuild._count.Projects })}:
            </span>
          </span>
        </div>
        <div class="items-start flex flex-col">
          <span class="flex items-center" title={m.softwareUpdate_created_title()}>
            <span class="text-nowrap overflow-hidden text-center mr-1">
              {m.softwareUpdate_created_title()}:
            </span>
            <span class="w-40 text-center">
              {getTimeDateString(rebuild.DateCreated)}
            </span>
          </span>

          {#if rebuild.DateCompleted}
            <span class="flex items-center" title={m.softwareUpdate_status_completed()}>
              <span class="text-nowrap overflow-hidden text-center mr-1">
                {m.softwareUpdate_status_completed()}:
              </span>
              <span class="w-40 text-center">
                {getTimeDateString(rebuild.DateCompleted)}
              </span>
            </span>
          {:else}
            <form class="mt-auto" method="post" action="?/cancel">
              <input type="hidden" name="rebuildId" value={rebuild.Id} />
              <SubmitButton
                key="common_cancel"
                icon={getActionIcon(ProductActionType.CancelWorkflow)}
                class="btn-secondary btn-sm"
              />
            </form>
          {/if}
        </div>
      </div>
      <div class="text-sm opacity-75 pl-2">
        <TaskComment comment={rebuild.Comment} />
      </div>
    </div>

    <div class="w-full bg-base-100 p-6 pt-2">
      {#if rebuild.Projects.length > 0}
        <div class="mb-2">
          <span class="font-semibold">
            {m.softwareUpdate_projects({ amount: rebuild._count.Projects })}:
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          {@render projects(rebuild.Projects)}
        </div>
      {/if}
    </div>
  </div>
{/snippet}

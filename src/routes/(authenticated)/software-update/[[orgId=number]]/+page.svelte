<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { parse } from 'devalue';
  import type { Readable } from 'svelte/store';
  import { source } from 'sveltekit-sse';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons, getActionIcon, getAppIcon } from '$lib/icons';
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
  import { byString } from '$lib/utils/sorting';
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

  let applicationTypeIds = $state(data.applicationTypes.map(({ Id }) => Id));

  const filteredProjects = $derived(
    data.projects.filter((p) => applicationTypeIds.find((id) => id === p.TypeId))
  );

  const products = $derived(filteredProjects.flatMap((p) => p.Products));

  const product_versions = $derived(Array.from(new Set(products.map((p) => p.NewVersion))));

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

<div class="w-full px-4">
  <h1>{m.softwareUpdate()}</h1>
  <p class="pl-8 mt-2 mb-6">{m.softwareUpdate_description()}</p>
  <div class="m-4">
    <form class="mx-4 flex flex-col" method="post" action="?/start" use:enhance>
      <input type="hidden" name="products" value={products.map((p) => p.Id)} />

      <div class="flex flex-col md:flex-row">
        <!-- Application Type Toggles -->
        <div class="grow min-w-xs mb-2">
          <h3 class="font-semibold mb-2 pl-0">{m.softwareUpdate_application_types_title()}</h3>
          <p class="text-sm text-gray-500 mb-4">
            {m.softwareUpdate_application_types_description()}
          </p>

          <div class="flex w-full">
            <div class="shrink space-y-2">
              {#each data.applicationTypes.toSorted( (a, b) => byString(a.Description, b.Description, getLocale()) ) as appType}
                <div class="flex space-x-2 items-center">
                  <input
                    type="checkbox"
                    name="applicationTypeIds"
                    value={appType.Id}
                    bind:group={applicationTypeIds}
                    class="toggle toggle-accent toggle-sm"
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
      <div class="flex-2">
        <DataDisplayBox
          title={m.softwareUpdate_summary_title()}
          fields={[
            {
              key: 'softwareUpdate_affected_organizations',
              value: data.organizations.join(', '),
              faint: data.organizations.length === 0
            },
            {
              key: 'softwareUpdate_projects',
              params: { amount: filteredProjects.length },
              snippet: projects
            },
            {
              key: 'softwareUpdate_products_label',
              value: products.length
            },
            {
              key: 'softwareUpdate_target_versions_label',
              value: product_versions.join(', '),
              faint: product_versions.length === 0
            }
          ]}
          data={filteredProjects}
        />
      </div>
      <input
        type="submit"
        class="btn btn-primary mt-6"
        value={m.softwareUpdate_rebuild_start()}
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
    {#each list as project, i}
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
          <span class="flex items-center mb-1" title={m.softwareUpdate_organization_title()}>
            <IconContainer icon={Icons.Organization} width={20} class="mr-1 shrink-0" />
            {rebuild.Organizations.join(',') ?? ''}
          </span>
          <span class="flex items-center mb-1" title={m.softwareUpdate_initiated_by()}>
            <IconContainer icon={Icons.User} width={20} class="mr-1 shrink-0" />
            {rebuild.InitiatedBy ?? ''}
          </span>
          <span class="flex items-center mb-1">
            <IconContainer icon={Icons.Package} width={20} class="mr-1 shrink-0" />
            <span class="font-semibold mr-1">{m.softwareUpdate_products_title()}:</span>
            {rebuild._count.Products}
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

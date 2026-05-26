<script lang="ts">
  import { parse } from 'devalue';
  import type { Readable } from 'svelte/store';
  import { source } from 'sveltekit-sse';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { getAppIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import type { ApplicationType } from '$lib/prisma';
  import type { RebuildsTable } from '$lib/software-updates';
  import RebuildCard from '$lib/software-updates/components/RebuildCard.svelte';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { isAdminForOrg } from '$lib/utils/roles';
  import { byString } from '$lib/utils/sorting';

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
            <div class="mb-4"><RebuildCard {rebuild} /></div>
          {/each}
        {/if}

        {#if rebuilds.complete.length > 0}
          <h1 class="mt-8">{m.softwareUpdate_completed_rebuilds_title()}</h1>
          {#each rebuilds.complete as rebuild}
            <div class="mb-4"><RebuildCard {rebuild} /></div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

{#snippet projects()}
  <span class="indent-0">
    {#each filteredProjects as project, i}
      {#if i > 0},{/if}
      <span class="inline-flex flex-row gap-2">
        {project.Name}
        <img src={getAppIcon(project.TypeId)} width={20} alt="" />
      </span>
    {/each}
  </span>
{/snippet}

<script lang="ts">
  import { parse } from 'devalue';
  import type { Readable } from 'svelte/store';
  import { source } from 'sveltekit-sse';
  import { superForm } from 'sveltekit-superforms';
  import ApplicationTypesSelector from '../ApplicationTypesSelector.svelte';
  import RebuildCard from '../RebuildCard.svelte';
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { RebuildItem, SoftwareUpdatesSSE } from '$lib/software-updates/sse';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { isAdminForOrg } from '$lib/utils/roles';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const currentPageUrl = page.url.pathname;
  let reconnectDelay = 1000;

  // Set up SSE connection for real-time updates on rebuilds related to the affected organizations.
  // The SSE endpoint will filter updates based on the org IDs provided in the query string.
  const softwareUpdatesSSE: Readable<SoftwareUpdatesSSE['rebuilds']> = $derived.by(() => {
    const orgIdsQuery = data.organizationIds.length
      ? `?orgIds=${encodeURIComponent(data.organizationIds.join(','))}`
      : '';

    return source(`${page.url.pathname}/sse${orgIdsQuery}`, {
      close({ connect }) {
        setTimeout(() => {
          if (currentPageUrl !== page.url.pathname) {
            // If the current page has changed, we don't want to reconnect.
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
  const rebuilds = $derived($softwareUpdatesSSE ?? data.rebuilds);

  const { form, enhance } = superForm(data.form, {
    resetForm: true,
    onUpdate({ form, result, formElement }) {
      if (form.valid && result.type === 'success') {
        toast('success', m.admin_software_update_toast_success());
        formElement.reset();
      }
    },
    onError({ result }) {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    }
  });

  // Filter products based on selected application types
  const filteredProducts = $derived.by(() =>
    $form.applicationTypeIds.length
      ? data.productsToRebuild.filter((p) => $form.applicationTypeIds.includes(p.applicationTypeId))
      : []
  );

  const filteredProductCount = $derived.by(() => filteredProducts.length);

  const filteredProjectNames = $derived.by(() => {
    const projectNames = new Set(filteredProducts.map((p) => p.projectName));
    return Array.from(projectNames).sort();
  });

  const filteredVersions = $derived.by(() => {
    const versions = new Set(
      filteredProducts.map((p) => p.requiredVersion).filter((v) => v !== null)
    );
    return Array.from(versions).sort();
  });

  const activeRebuilds = $derived.by(() => rebuilds.filter((r: RebuildItem) => !r.DateCompleted));
  const completedRebuilds = $derived.by(() => rebuilds.filter((r: RebuildItem) => r.DateCompleted));

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
  <h1>{m.admin_nav_software_update()}</h1>
  <p class="pl-8 mt-2 mb-6">{m.admin_nav_software_update_description()}</p>
  <div class="m-4">
    <form class="mx-4" method="post" action="?/start" use:enhance>
      <div class="flex flex-col lg:flex-row m-6">
        <!-- Application Type Toggles -->
        <div class="flex-1">
          <h2 class="font-semibold mb-2">{m.admin_software_update_application_types_title()}</h2>
          <p class="text-sm text-gray-500 mb-4">
            {m.admin_software_update_application_types_description()}
          </p>
          <ApplicationTypesSelector
            applicationTypes={data.applicationTypes.map((at) => ({ ...at, Name: at.Name ?? '' }))}
          >
            {#snippet selector(appType)}
              <input
                type="checkbox"
                name="applicationTypeIds"
                value={appType.Id}
                bind:group={$form.applicationTypeIds}
                class="toggle toggle-accent toggle-sm"
              />
            {/snippet}
          </ApplicationTypesSelector>
        </div>
        <!-- Summary Information -->
        <div class="flex-2 mt-18">
          <DataDisplayBox
            title={m.admin_software_update_summary_title()}
            fields={[
              {
                key: 'admin_software_update_affected_organizations',
                value: data.organizations.map((o) => o.Name ?? '').join(', ')
              },
              {
                key: 'admin_software_update_projects_label',
                value: new Set(filteredProducts.map((p) => p.projectId)).size
              },
              {
                key: 'admin_software_update_products_label',
                value: filteredProductCount
              },
              {
                key: 'admin_software_update_project_names_label',
                value: filteredProjectNames.join(', '),
                faint: filteredProjectNames.length === 0
              },
              {
                key: 'admin_software_update_target_versions_label',
                value: filteredVersions.join(', '),
                faint: filteredVersions.length === 0
              }
            ]}
          />
        </div>
      </div>
      <br />
      <LabeledFormInput key="admin_nav_software_update_comment">
        <input
          type="text"
          name="comment"
          class="input input-bordered w-full validator"
          bind:value={$form.comment}
          required
        />
        <span class="validator-hint">{m.admin_software_update_comment_required()}</span>
      </LabeledFormInput>

      <input
        type="submit"
        class="btn btn-primary mt-6"
        value={m.admin_software_update_rebuild_start()}
        disabled={$form.applicationTypeIds.length === 0 || filteredProductCount === 0}
      />
    </form>
    <!-- Rebuilds List -->
    <div class="m-4">
      {#if rebuilds.length > 0}
        <div class="space-y-6">
          {#if activeRebuilds.length > 0}
            <h1>{m.admin_software_update_active_rebuilds_title()}</h1>
            {#each activeRebuilds as rebuild}
              <div class="mb-4"><RebuildCard {rebuild} /></div>
            {/each}
          {/if}

          {#if completedRebuilds.length > 0}
            <h1 class="mt-8">{m.admin_software_update_completed_rebuilds_title()}</h1>
            {#each completedRebuilds as rebuild}
              <div class="mb-4"><RebuildCard {rebuild} /></div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

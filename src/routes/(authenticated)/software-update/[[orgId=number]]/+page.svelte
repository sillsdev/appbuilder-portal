<script lang="ts">
  import { onDestroy } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import ApplicationTypesSelector from '../ApplicationTypesSelector.svelte';
  import RebuildCard from '../RebuildCard.svelte';
  import type { PageData } from './$types';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { isAdminForOrg } from '$lib/utils/roles';
  import { parse } from 'devalue';
  import { source } from 'sveltekit-sse';


  interface Props {
    data: PageData;
  }

  // Response structure from software update initiation
  interface SoftwareUpdateResponse {
    ok?: boolean;
    initiatedBy?: string;
    comment?: string;
    productCount?: number;
    timestamp?: string;
    updateIds?: number[];
  }

  // Summary information after initiating the update
  type Summary = {
    initiatedBy?: string;
    comment?: string;
    productCount?: number;
    timestamp?: string;
  };

  interface RebuildData {
    Id: number;
    Comment: string;
    DateCreated: Date | null;
    DateCompleted: Date | null;
    Version: string;
    Paused: boolean;
    InitiatedBy: {
      Name: string | null;
      Email: string | null;
    };
    ApplicationType: {
      Name: string | null;
      Description: string | null;
    };
    Projects: Array<{
      Id: number;
      Name: string | null;
    }>;
    _count: {
      Products: number;
    };
  }

  let { data }: Props = $props();

  const { form, enhance, reset } = superForm(data.form, {
    resetForm: false,
    onUpdate(event) {
      const response = event.result.data as SoftwareUpdateResponse;
      // Show success toast and summary if update initiation was successful
      if (event.form.valid && response?.ok) {
        toast('success', m.admin_software_update_toast_success());
        // Populate summary details
        summary = {
          initiatedBy: response.initiatedBy,
          comment: response.comment,
          productCount: response.productCount,
          timestamp: response.timestamp
        };
        showSummary = true;
        // Reset the form for new input
        reset();
      }
    }
  });
 
  let showSummary = $state(false);
  // Summary details after initiating the update
  let summary = $state<Summary | null>(null);

  // SSE management 
  let sseUnsubscribe: (() => void) | null = null;
  let reconnectDelay = 1000;
  let rebuilds = $state<RebuildData[]>(data.rebuilds);

  // Filter products based on selected application types
  let filteredProducts = $derived(() => {
    if (!$form.applicationTypeIds || $form.applicationTypeIds.length === 0) return [];
    return data.productsToRebuild.filter(p => $form.applicationTypeIds.includes(p.applicationTypeId));
  });

  // Calculate reactive counts and lists
  let filteredProductCount = $derived(filteredProducts().length);
  
  let filteredProjectCount = $derived(new Set(filteredProducts().map(p => p.projectId)).size);

  let filteredProjectNames = $derived(() => {
    const projectNames = new Set(filteredProducts().map(p => p.projectName));
    return Array.from(projectNames).sort();
  });

  let filteredVersions = $derived(() => {
    const versions = new Set(filteredProducts().map(p => p.requiredVersion).filter(v => v !== null));
    return Array.from(versions).sort();
  });

  async function startSSE(orgIds: number[]) {
    if (sseUnsubscribe) {
      sseUnsubscribe();
      sseUnsubscribe = null;
    }
    const qs = encodeURIComponent(orgIds.join(','));
    const rebuildsSSE = source(`sse?orgIds=${qs}`, {
      close({ connect }) {
        setTimeout(() => {
          connect();
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        }, reconnectDelay);
      }
    })
      .select('rebuilds')
      .transform((t) => (t ? parse(t) : undefined));

    sseUnsubscribe = rebuildsSSE.subscribe((data) => {
      if (!data) return;
      rebuilds = data;
    });
  }

  afterNavigate((_) => {
    if (rebuilds?.length) {
      const updateIds = rebuilds.map((u) => u.Id);
      startSSE(updateIds);
      showSummary = true;
      summary = null;
    }
  });

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

  onDestroy(() => {
    // Clean up SSE subscription on component destroy
    if (sseUnsubscribe) sseUnsubscribe();
  });
</script>

<div class="w-full px-4">
  <h1>{m.admin_nav_software_update()}</h1>
  <p class="pl-8 mt-2 mb-6">{m.admin_nav_software_update_description()}</p>
  <div class="m-4">
      <form class="mx-4" method="post" action="?/start" use:enhance>
        <!-- Application Type Toggles and Summary Side by Side -->
        <div class="flex flex-col lg:flex-row m-6">
          <!-- Application Type Toggles -->
          <div class="flex-1">
            <h2 class="font-semibold mb-2">{m.admin_software_update_application_types_title()}</h2>
            <p class="text-mb text-gray-500 mb-4">{m.admin_software_update_application_types_description()}</p>
            <ApplicationTypesSelector applicationTypes={data.applicationTypes.map(at => ({ ...at, Name: at.Name ?? '' }))}>
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
                value: data.organizations
              },
              {
                key: 'admin_software_update_projects_label',
                value: filteredProjectCount
              },
              {
                key: 'admin_software_update_products_label',
                value: filteredProductCount
              },
              {
                key: 'admin_software_update_project_names_label',
                value: filteredProjectNames().join(', '),
                faint: filteredProjectNames().length === 0
              },
              {
                key: 'admin_software_update_target_versions_label',
                value: filteredVersions().join(', '),
                faint: filteredVersions().length === 0
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
          <h1>
              Active Software Updates
          </h1>
          {#each rebuilds as rebuild}
            {#if !rebuild.DateCompleted}
              <span class ="mb-4"><RebuildCard {rebuild} /></span>
            {/if}
          {/each}
          <h1>
              Completed Software Updates
          </h1>
          {#each rebuilds as rebuild}
            {#if rebuild.DateCompleted}
              <span class ="mb-4"><RebuildCard {rebuild} /></span>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

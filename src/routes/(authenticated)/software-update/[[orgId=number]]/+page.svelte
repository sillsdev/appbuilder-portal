<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  interface SoftwareUpdateResponse {
    ok?: boolean;
    initiatedBy?: string;
    comment?: string;
    productCount?: number;
    timestamp?: string;
    updateIds?: number[];
  }

  type Summary = {
    initiatedBy?: string;
    comment?: string;
    productCount?: number;
    timestamp?: string;
  };

  let { data }: Props = $props();

  const { form, enhance, reset } = superForm(data.form, {
    resetForm: false,
    onUpdate(event) {
      const response = event.result.data as SoftwareUpdateResponse;
      if (event.form.valid && response?.ok) {
        toast('success', m.admin_software_update_toast_success());
        summary = {
          initiatedBy: response.initiatedBy,
          comment: response.comment,
          productCount: response.productCount,
          timestamp: response.timestamp
        };
        showSummary = true;
        if (response.updateIds?.length) {
          startPolling(response.updateIds);
        }
        // Clear the form after showing summary
        reset();
      }
    }
  });

  let showSummary = $state(false);
  let summary = $state<Summary | null>(null);

  let pollHandle: ReturnType<typeof setInterval> | null = null;
  let completedCount = $state(0);

  async function startPolling(ids: number[]) {
    // Clear existing poll
    if (pollHandle) clearInterval(pollHandle);
    const qs = encodeURIComponent(ids.join(','));
    // Poll every 10s
    pollHandle = setInterval(async () => {
      try {
        const res = await fetch(`status?ids=${qs}`);
        if (!res.ok) return;
        const json = (await res.json()) as {
          paused: boolean;
          allCompleted: boolean;
          completedProducts?: number;
        };
        if (json.completedProducts !== undefined) {
          completedCount = json.completedProducts;
        }
        if (json.paused) {
          toast('info', m.admin_software_update_paused_message());
          clearInterval(pollHandle!);
          pollHandle = null;
          // Keep state persisted so user can see what was paused and potentially resume
        } else if (json.allCompleted) {
          toast('success', m.admin_software_update_all_completed_message());
          clearInterval(pollHandle!);
          pollHandle = null;
          showSummary = false;
        }
      } catch {
        /* ignore network errors */
      }
    }, 10000);
  }

  onMount(() => {
    if (data.activeUpdates?.length) {
      const updateIds = data.activeUpdates.map((u) => u.Id);
      startPolling(updateIds);
      showSummary = true;
      // Note: summary details will be shown from the last polling response
    }
  });

  onDestroy(() => {
    if (pollHandle) clearInterval(pollHandle);
  });
</script>

<div class="w-full">
  <h1>{m.admin_nav_software_update()}</h1>
  <div class="m-4">
    <p class="pl-4">{m.admin_nav_software_update_description()}</p>
    <br />

    <!-- Summary Information -->
    {#if !showSummary}
      <DataDisplayBox
        title={m.admin_software_update_summary_title()}
        fields={[
          {
            key: 'admin_software_update_affected_organizations',
            value: data.organizations
          }
        ]}
      >
        <p class="pl-4 -indent-4">
          <b>{m.admin_software_update_projects_label()}:</b>
          {data.affectedProjectCount}
        </p>
        <p class="pl-4 -indent-4">
          <b>{m.admin_software_update_products_label()}:</b>
          {data.affectedProductCount}
        </p>
        {#if data.affectedProjects && data.affectedProjects.length > 0}
          <p class="pl-4 -indent-4 text-sm opacity-75">
            <b>{m.admin_software_update_project_names_label()}:</b>
            {data.affectedProjects.join(', ')}
          </p>
        {/if}
        {#if data.affectedVersions && data.affectedVersions.length > 0}
          <p class="pl-4 -indent-4 text-sm opacity-75">
            <b>{m.admin_software_update_target_versions_label()}:</b>
            {data.affectedVersions.join(', ')}
          </p>
        {/if}
        {#if data.affectedProductCount === 0}
          <p class="pl-4 -indent-4 text-info font-bold mt-2">
            {m.admin_software_update_no_products_message()}
          </p>
        {/if}
      </DataDisplayBox>
    {/if}

    <br />

    {#if !showSummary && data.affectedProductCount > 0}
      <form class="pl-4" method="post" action="?/start" use:enhance>
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
          class="btn btn-primary"
          value={m.admin_software_update_rebuild_start()}
          disabled={data.affectedProductCount === 0}
        />
      </form>
    {/if}

    {#if showSummary && summary}
      <DataDisplayBox
        title={m.admin_software_update_rebuild_started_title()}
        fields={[
          {
            key: 'admin_software_update_affected_organizations',
            value: data.organizations
          },
          {
            key: 'admin_software_update_initiated_by',
            value: summary.initiatedBy
          },
          {
            key: 'admin_nav_software_update_comment',
            value: summary.comment
          }
        ]}
      >
        <p class="pl-4 -indent-4">
          <b>{m.admin_software_update_products_rebuilding_label()}:</b>
          {summary.productCount ?? 0}
        </p>
        {#if (summary.productCount ?? 0) > 0}
          <p class="pl-4 -indent-4 mt-4">
            <b>{m.admin_software_update_progress_label()}:</b>
            {completedCount} / {summary.productCount}
          </p>
          <progress
            class="progress progress-primary w-full mt-2"
            value={completedCount}
            max={summary.productCount ?? 1}
          ></progress>
        {/if}
      </DataDisplayBox>
    {/if}
  </div>
</div>

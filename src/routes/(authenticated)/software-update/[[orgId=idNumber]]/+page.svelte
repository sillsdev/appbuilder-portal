<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { persistedSession } from '$lib/stores';
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

  const activeUpdateIds = persistedSession<number[]>('software-update-active-ids', []);
  const persistedSummary = persistedSession<Summary | null>('software-update-summary', null);

  const { form, enhance, reset } = superForm(data.form, {
    resetForm: false,
    onUpdated({ form }) {
      const response = form.message as SoftwareUpdateResponse;
      if (response?.ok) {
        toast('success', m.admin_software_update_toast_success());
        summary = {
          initiatedBy: response.initiatedBy,
          comment: response.comment,
          productCount: response.productCount,
          timestamp: response.timestamp
        };
        persistedSummary.set(summary);
        showSummary = true;
        if (response.updateIds?.length) {
          activeUpdateIds.set(response.updateIds);
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
          activeUpdateIds.set([]);
          persistedSummary.set(null);
          showSummary = false;
        }
      } catch {
        /* ignore network errors */
      }
    }, 10000);
  }

  onMount(() => {
    const existing = $activeUpdateIds;
    if (existing && existing.length) {
      startPolling(existing);
      showSummary = true;
      const existingSummary = $persistedSummary;
      if (existingSummary) summary = existingSummary;
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
        <p style="padding-left: 1rem; text-indent: -1rem">
          <b>{m.admin_software_update_projects_label()}:</b>
          {data.affectedProjectCount}
        </p>
        <p style="padding-left: 1rem; text-indent: -1rem">
          <b>{m.admin_software_update_products_label()}:</b>
          {data.affectedProductCount}
        </p>
        {#if data.affectedProjects && data.affectedProjects.length > 0}
          <p style="padding-left: 1rem; text-indent: -1rem" class="text-sm opacity-75">
            <b>{m.admin_software_update_project_names_label()}:</b>
            {data.affectedProjects.join(', ')}
          </p>
        {/if}
        {#if data.affectedVersions && data.affectedVersions.length > 0}
          <p style="padding-left: 1rem; text-indent: -1rem" class="text-sm opacity-75">
            <b>{m.admin_software_update_target_versions_label()}:</b>
            {data.affectedVersions.join(', ')}
          </p>
        {/if}
        {#if data.affectedProductCount === 0}
          <p style="padding-left: 1rem; text-indent: -1rem" class="text-info font-bold mt-2">
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
        <p style="padding-left: 1rem; text-indent: -1rem">
          <b>{m.admin_software_update_products_rebuilding_label()}:</b>
          {summary.productCount ?? 0}
        </p>
        {#if (summary.productCount ?? 0) > 0}
          <p style="padding-left: 1rem; text-indent: -1rem; margin-top: 1rem">
            <b>{m.admin_software_update_progress_label()}:</b>
            {completedCount} / {summary.productCount}
          </p>
          <div
            style="width: 100%; margin-top: 0.5rem; border-style: solid; border-color: white; border-width: 1px; border-radius: 4px; overflow: hidden; height: 24px;"
          >
            <div
              style="width: {(completedCount / (summary.productCount ?? 1)) *
                100}%; background: white; height: 100%; display: flex; align-items: center; justify-content: center;"
            ></div>
          </div>
        {/if}
      </DataDisplayBox>
    {/if}
  </div>
</div>

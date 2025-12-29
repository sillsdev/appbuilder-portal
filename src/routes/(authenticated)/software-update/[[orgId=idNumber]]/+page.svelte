<script lang="ts">
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
  }

  let { data }: Props = $props();

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
        showSummary = true;
        // Clear the form after showing summary
        reset();
      }
    }
  });

  let showSummary = $state(false);
  let summary = $state<{
    initiatedBy?: string;
    comment?: string;
    productCount?: number;
    timestamp?: string;
  } | null>(null);
</script>

<div class="w-full">
  <h1>{m.admin_nav_software_update()}</h1>
  <div class="m-4">
    <p class="pl-4">{m.admin_nav_software_update_description()}</p>
    <br />

    <!-- Summary Information -->
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
        {data.affectedProjectCount} project{data.affectedProjectCount !== 1 ? 's' : ''}
      </p>
      <p style="padding-left: 1rem; text-indent: -1rem">
        <b>{m.admin_software_update_products_label()}:</b>
        {data.affectedProductCount} product{data.affectedProductCount !== 1 ? 's' : ''}
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
      </DataDisplayBox>
    {/if}
  </div>
</div>

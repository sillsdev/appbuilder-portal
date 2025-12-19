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

  let { data }: Props = $props();

  const { form, enhance, reset } = superForm(data.form, {
    resetForm: false,
    onUpdated({ form }) {
      // Type assertion to access server action response properties
      const response = form.data as any;
      if (form.valid && response.ok) {
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
      title="Update Summary"
      fields={[
        {
          key: 'admin_software_update_affected_organizations',
          value: data.organizations
        }
      ]}
    >
      <p style="padding-left: 1rem; text-indent: -1rem">
        <b>Projects:</b>
        {data.affectedProjectCount} project{data.affectedProjectCount !== 1 ? 's' : ''}
      </p>
      <p style="padding-left: 1rem; text-indent: -1rem">
        <b>Products:</b>
        {data.affectedProductCount} product{data.affectedProductCount !== 1 ? 's' : ''}
      </p>
      {#if data.affectedProjects && data.affectedProjects.length > 0}
        <p style="padding-left: 1rem; text-indent: -1rem" class="text-sm opacity-75">
          <b>Project Names:</b>
          {data.affectedProjects.join(', ')}
        </p>
      {/if}
      {#if data.affectedVersions && data.affectedVersions.length > 0}
        <p style="padding-left: 1rem; text-indent: -1rem" class="text-sm opacity-75">
          <b>Target Versions:</b>
          {data.affectedVersions.join(', ')}
        </p>
      {/if}
    </DataDisplayBox>

    <br />

    {#if !showSummary}
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
        />
      </form>
    {/if}

    {#if showSummary && summary}
      <DataDisplayBox
        title="Rebuild Started"
        fields={[
          {
            key: 'admin_software_update_affected_organizations',
            value: summary.initiatedBy
          },
          {
            key: 'admin_nav_software_update_comment',
            value: summary.comment
          }
        ]}
      >
        <p style="padding-left: 1rem; text-indent: -1rem">
          <b>Products Rebuilding:</b>
          {summary.productCount ?? 0}
        </p>
      </DataDisplayBox>
    {/if}
  </div>
</div>

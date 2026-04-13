<script lang="ts">
  import { parse } from 'devalue';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byString } from '$lib/utils/sorting';
  import type { Readable } from 'svelte/store';
  import { source } from 'sveltekit-sse';
  import { superForm } from 'sveltekit-superforms';
  import RebuildCard from '$lib/software-updates/components/RebuildCard.svelte';
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import type { RebuildItem, SoftwareUpdatesSSE } from '$lib/software-updates';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { isAdminForOrg } from '$lib/utils/roles';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const rebuilds = $derived(data.rebuilds);
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
      } else {
        console.log('Unspecified error');
      }
    }
  });

  let applicationTypeIds = $state(data.applicationTypes);
  const products = $derived(
    data.products.filter(({ TypeId }) => applicationTypeIds.includes(TypeId))
  );

  const product_versions = $derived(Array.from(new Set(products.map((p) => p.NewVersion))));
  const project_names = $derived(Array.from(new Set(products.map((p) => p.ProjectName))));

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
  <h1>{m.admin_nav_software_update()}</h1>
  <p class="pl-8 mt-2 mb-6">{m.admin_nav_software_update_description()}</p>
  <div class="m-4">
    <div class="flex flex-col lg:flex-row m-6">
      <!-- Application Type Toggles -->
      <div class="flex-1">
        <h2 class="font-semibold mb-2">{m.admin_software_update_application_types_title()}</h2>
        <p class="text-sm text-gray-500 mb-4">
          {m.admin_software_update_application_types_description()}
        </p>

        <div class="flex w-full">
          <div class="shrink space-y-2">
            {#each data.applicationTypes.toSorted( (a, b) => byString(a.Description, b.Description, getLocale()) ) as appType}
              <div class="flex space-x-2">
                <input
                  type="checkbox"
                  name="applicationTypeIds"
                  value={appType.Id}
                  bind:group={applicationTypeIds}
                  class="toggle toggle-accent toggle-sm"
                />
                <div>
                  <div class="font-medium">{appType.Description ?? ''}</div>
                </div>
              </div>
            {/each}
          </div>
          <div class="grow"></div>
        </div>
      </div>
      <!-- Summary Information -->
      <div class="flex-2 mt-18">
        <DataDisplayBox
          title={m.admin_software_update_summary_title()}
          fields={[
            {
              key: 'admin_software_update_affected_organizations',
              value: data.organizations.join(', '),
              faint: data.organizations.length === 0
            },
            {
              key: 'admin_software_update_projects_label',
              value: project_names.length
            },
            {
              key: 'admin_software_update_products_label',
              value: products.length
            },
            {
              key: 'admin_software_update_project_names_label',
              value: project_names.join(', '),
              faint: project_names.length === 0
            },
            {
              key: 'admin_software_update_target_versions_label',
              value: product_versions.join(', '),
              faint: product_versions.length === 0
            }
          ]}
        />
      </div>
    </div>
    <br />

    <form class="mx-4" method="post" action="?/start" use:enhance>
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

      <input type="hidden" name="products" value={products.map((p) => p.Id)} />
      <input
        type="submit"
        class="btn btn-primary mt-6"
        value={m.admin_software_update_rebuild_start()}
        disabled={applicationTypeIds.length === 0 || products.length === 0}
      />
    </form>

    <!-- Rebuilds List -->
    <div class="m-4">
      <div class="space-y-6">
        {#if rebuilds.incomplete.length > 0}
          <h1>{m.admin_software_update_active_rebuilds_title()}</h1>
          {#each rebuilds.incomplete as rebuild}
            <div class="mb-4"><RebuildCard {rebuild} /></div>
          {/each}
        {/if}

        {#if rebuilds.complete.length > 0}
          <h1 class="mt-8">{m.admin_software_update_completed_rebuilds_title()}</h1>
          {#each rebuilds.complete as rebuild}
            <div class="mb-4"><RebuildCard {rebuild} /></div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<a href="product-definitions/new" class="btn btn-outline m-4 mt-0">
  {m.admin_settings_productDefinitions_add()}
</a>

<div class="flex flex-col w-full">
  {#each data.productDefinitions.sort((a, b) => byName(a, b, languageTag())) as pD}
    <DataDisplayBox
      editable
      onEdit={() => goto(base + '/admin/settings/product-definitions/edit?id=' + pD.Id)}
      title={pD.Name}
      fields={[
        {
          key: 'admin_settings_productDefinitions_type',
          value: pD.ApplicationTypes.Name // TODO: this doesn't actually mean anything for the product definition, so we may want to remove this entirely from the UI.
        },
        {
          key: 'admin_settings_productDefinitions_workflow',
          value: pD.Workflow.Name
        },
        {
          key: 'admin_settings_productDefinitions_rebuildWorkflow',
          value: pD.RebuildWorkflow?.Name
        },
        {
          key: 'admin_settings_productDefinitions_republishWorkflow',
          value: pD.RepublishWorkflow?.Name
        },
        {
          key: 'admin_settings_productDefinitions_description',
          value: pD.Description
        }
      ]}
    />
  {/each}
</div>

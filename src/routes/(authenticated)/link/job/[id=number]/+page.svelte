<script lang="ts">
  import type { PageData } from './$types';
  import { getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<table class="table">
  <thead>
    <tr>
      <th>{m.projectTable_project()}</th>
      <th>{m.tasks_product()}</th>
      <th>{m.projectTable_org()}</th>
      <th>{m.org_buildEngineURL()}</th>
    </tr>
  </thead>
  <tbody>
    {#each data.products as product}
      {@const beURL = product.Project.Organization.UseDefaultBuildEngine
        ? data.defaultBuildEngine.BuildEngineUrl
        : product.Project.Organization.System?.BuildEngineUrl}
      <tr>
        <td>
          {product.Project.Name}
        </td>
        <td>
          <a class="link" href="/projects/{product.Project.Id}#{product.Id}">
            <IconContainer
              icon={getProductIcon(product.ProductDefinition.Workflow.ProductType)}
              width={20}
            />{product.ProductDefinition.Name}
          </a>
        </td>
        <td>{product.Project.Organization.Name}</td>
        <td>
          {#if beURL}
            {@const href = `${beURL}/job-admin/view?id=${product.BuildEngineJobId}`}
            <a class="link" {href}>{href}</a>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

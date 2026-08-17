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
    {#each data.builds as build}
      {@const beURL = build.Product.Project.Organization.UseDefaultBuildEngine
        ? data.defaultBuildEngine.BuildEngineUrl
        : build.Product.Project.Organization.System?.BuildEngineUrl}
      <tr>
        <td>
          {build.Product.Project.Name}
        </td>
        <td>
          <a
            class="link"
            href="/products/{build.ProductId}/files?buildId={build.BuildEngineBuildId}"
          >
            <IconContainer
              icon={getProductIcon(build.Product.ProductDefinition.Workflow.ProductType)}
              width={20}
            />{build.Product.ProductDefinition.Name}
          </a>
        </td>
        <td>{build.Product.Project.Organization.Name}</td>
        <td>
          {#if beURL}
            {@const href = `${beURL}/build-admin/view?id=${build.BuildEngineBuildId}`}
            <a class="link" {href}>{href}</a>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<script lang="ts">
  import type { PageData } from './$types';
  import { getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';

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
    {#each data.releases as release}
      {@const beURL = release.Product.Project.Organization.UseDefaultBuildEngine
        ? data.defaultBuildEngine.BuildEngineUrl
        : release.Product.Project.Organization.System?.BuildEngineUrl}
      <tr>
        <td>
          {release.Product.Project.Name}
        </td>
        <td>
          <a
            class="link"
            href={localizeHref(
              `/products/${release.ProductId}/files?releaseId=${release.BuildEngineReleaseId}`
            )}
          >
            <IconContainer
              icon={getProductIcon(release.Product.ProductDefinition.Workflow.ProductType)}
              width={20}
            />{release.Product.ProductDefinition.Name}
          </a>
        </td>
        <td>{release.Product.Project.Organization.Name}</td>
        <td>
          {#if beURL}
            {@const href = `${beURL}/release-admin/view?id=${release.BuildEngineReleaseId}`}
            <a class="link" {href}>{href}</a>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

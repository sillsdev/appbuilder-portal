<script lang="ts">
  import type { PageData } from './$types';
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
      <th>{m.projectTable_org()}</th>
      <th>{m.org_buildEngineURL()}</th>
    </tr>
  </thead>
  <tbody>
    {#each data.projects as project}
      {@const beURL = project.Organization.UseDefaultBuildEngine
        ? data.defaultBuildEngine.BuildEngineUrl
        : project.Organization.System?.BuildEngineUrl}
      <tr>
        <td><a class="link" href={localizeHref(`/projects/${project.Id}`)}>{project.Name}</a></td>
        <td>{project.Organization.Name}</td>
        <td>
          {#if beURL}
            {@const href = `${beURL}/project-admin/view?id=${project.BuildEngineProjectId}`}
            <a class="link" {href}>{href}</a>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

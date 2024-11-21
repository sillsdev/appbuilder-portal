<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import { getRelativeTime } from '$lib/timeUtils';
  import type { PageData } from './$types';
  import { bytesToHumanSize } from '$lib/utils';

  export let data: PageData;
  let selectedBuildId: number;
  $: selectedBuild = data.builds.find((b) => b.Id === selectedBuildId);
  // TODO: test this page with artifacts
</script>

<div class="w-full max-w-6xl mx-auto p-4">
  <div class="breadcrumbs text-sm pl-4">
    <ul>
      <li>
        <a class="link" href="/projects/{data.product?.Project.Id}">{data.product?.Project.Name}</a>
      </li>
      <li>{data.product?.ProductDefinition.Name}</li>
    </ul>
  </div>
  <h1 class="pl-4">{m.products_files_title()}</h1>
  <select class="select font-bold text-lg text-info" bind:value={selectedBuildId}>
    {#if data.builds.length === 0}
      <option disabled selected value="-1">
        {m.projects_noBuilds()}
      </option>
    {/if}
    {#each data.builds as build}
      <option value={build.Id} class="font-bold text-lg">
        {#if build.BuildId === data.product?.WorkflowBuildId}
          {m.projects_latestBuild({
            version:
              build.Version ??
              ` ${build.Success === false ? m.projects_buildFailed() : m.projects_buildPending()} `
          })}
        {:else}
          {build.Version ?? (build.Success ? m.projects_buildPending() : m.projects_buildFailed())}
        {/if}
      </option>
    {/each}
  </select>
  <div class="rounded-md border border-slate-400 w-full my-2">
    <div class="bg-base-300 p-2 flex flex-row rounded-t-md place-content-between">
      <span>
        <IconContainer icon={getIcon(data.product?.ProductDefinition.Name ?? '')} width="24" />
        {data.product?.ProductDefinition.Name}
      </span>
      <span>
        <!-- TODO i18n (requires pluralization support) -->
        {m.project_products_numArtifacts({ amount: selectedBuild?.ProductArtifacts.length })}
      </span>
    </div>
    <div class="p-2">
      {#if !selectedBuild?.ProductArtifacts.length}
        {m.project_products_noArtifacts()}
      {:else}
        <table class="table table-auto">
          <thead>
            <tr>
              <th>{m.project_products_filename()}</th>
              <th>{m.project_products_updated()}</th>
              <th class="text-right">{m.project_products_size()}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {#each selectedBuild?.ProductArtifacts as artifact}
              <tr>
                <td><IconContainer icon="mdi:file" width="20" /> {artifact.ArtifactType}</td>
                <td>{getRelativeTime(artifact.DateUpdated)}</td>
                <td class="text-right">{bytesToHumanSize(artifact.FileSize)}</td>
                <td class="text-right">
                  <a href={artifact.Url} download>
                    <IconContainer icon="mdi:download" width="20" />
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

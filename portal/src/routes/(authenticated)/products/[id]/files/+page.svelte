<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getIcon } from '$lib/icons/productDefinitionIcon';
  import * as m from '$lib/paraglide/messages';
  import { getTimeDateString } from '$lib/timeUtils';
  import type { PageData } from './$types';

  export let data: PageData;
  let selectedBuildId: number;
  $: selectedBuild = data.builds.find((b) => b.Id === selectedBuildId);
  function bytesToHumanSize(bytes: bigint) {
    const base = BigInt('1024');
    if (bytes > base ** BigInt(3)) {
      return bytes / base ** BigInt(3) + ' GB';
    } else if (bytes > base * base) {
      return bytes / (base * base) + ' MB';
    } else if (bytes > base) {
      return bytes / base + ' KB';
    } else {
      return bytes + ' bytes';
    }
  }
  // TODO: test this page with artifacts
</script>

<div class="w-full max-w-6xl mx-auto p-4">
  <h1>{m.products_files_title()}: {data.product?.Project.Name}</h1>
  <select class="select" bind:value={selectedBuildId}>
    {#if data.builds.length === 0}
      <option disabled selected value="-1">
        {m.projects_noBuilds()}
      </option>
    {/if}
    {#each data.builds as build}
      <option value={build.Id}>{build.BuildId}</option>
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
      {#if selectedBuild?.ProductArtifacts.length ?? 0 === 0}
        {m.project_products_noArtifacts()}
      {:else}
        <table>
          <thead>
            <tr>
              <th>{m.project_products_filename()}</th>
              <th>{m.project_products_updated}</th>
              <th>{m.project_products_size()}</th>
            </tr>
          </thead>
          <tbody>
            {#each selectedBuild?.ProductArtifacts ?? [] as artifact}
              <tr>
                <td><IconContainer icon="mdi:file" width="20" /> {artifact.ArtifactType}</td>
                <td>{getTimeDateString(artifact.DateUpdated)}</td>
                <td>{bytesToHumanSize(artifact.FileSize ?? BigInt(0))}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

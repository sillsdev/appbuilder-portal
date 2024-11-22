<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { getRelativeTime } from '$lib/timeUtils';
  import { bytesToHumanSize } from '$lib/utils';
  import ArrowDownIcon from '$lib/icons/ArrowDownIcon.svelte';
  import ArrowUpIcon from '$lib/icons/ArrowUpIcon.svelte';

  export let build: {
    Version: string | null;
    Success: boolean | null;
    BuildId: number;
    ProductArtifacts: {
      ArtifactType: string | null;
      FileSize: bigint | null;
      Url: string | null;
      DateUpdated: Date | null;
    }[];
  };

  export let latestBuildId: number | undefined;

  export let hidden = false;

  function versionString(b: typeof build): string {
    let version = b.Version;
    if (version === null) {
      if (b.Success === false) {
        version = ` ${m.projects_buildFailed()} `;
      } else {
        version = ` ${m.projects_buildPending()} `;
      }
    }

    if (b.BuildId === latestBuildId) {
      return m.projects_latestBuild({ version });
    }
    return version;
  }
</script>

<div class="rounded-md border border-slate-400 w-full my-2">
  <div class="bg-base-300 p-2 flex flex-row rounded-t-md place-content-between">
    <span class="font-bold text-lg text-info grow">
      {versionString(build)}
    </span>
    <span>
      <!-- TODO i18n (requires pluralization support) -->
      {m.project_products_numArtifacts({ amount: build.ProductArtifacts.length })}
    </span>
    <button on:click={() => hidden = !hidden}>
      {#if hidden}
        <ArrowUpIcon />
      {:else}
        <ArrowDownIcon />
      {/if}
    </button>
  </div>
  <div class="p-2" class:hidden>
    {#if !build.ProductArtifacts.length}
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
          {#each build.ProductArtifacts as artifact}
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

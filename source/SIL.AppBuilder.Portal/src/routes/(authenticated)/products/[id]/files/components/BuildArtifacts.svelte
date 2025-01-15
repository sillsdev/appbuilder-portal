<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import * as m from '$lib/paraglide/messages';
  import { getRelativeTime } from '$lib/timeUtils';
  import { bytesToHumanSize } from '$lib/utils';

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

  // temporary fix until paraglide supports pluralization
  function pluralized(amount: number): string {
    const message = m.project_products_numArtifacts({ amount });
    if (amount === 0) {
      return message.match(/=0 *\{(.*?)\}/)![1];
    }
    else {
      const matches = message.match(/other *\{(.*?)\{ amount \}(.*?)\}/);
      return `${matches![1]}${amount}${matches![2]}`;
    }
  }
</script>

<div class="rounded-md border border-slate-400 w-full my-2">
  <div class="bg-neutral p-2 flex flex-row rounded-t-md place-content-between">
    <span class="font-bold text-lg text-info grow">
      {versionString(build)}
    </span>
    <span>
      {pluralized(build.ProductArtifacts.length)}
    </span>
  </div>
  <div class="p-2 overflow-x-auto">
    {#if !build.ProductArtifacts.length}
      {m.project_products_noArtifacts()}
    {:else}
      <table class="table table-auto bg-base-100">
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

<style lang="postcss">
  tr > th:first-child,
  tr > td:first-child {
    position: sticky;
    left: 0;
  }

  tr td,
  tr th {
    @apply bg-base-100;
  }
</style>

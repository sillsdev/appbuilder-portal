<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import ReleaseInfo from '$lib/products/components/ReleaseInfo.svelte';
  import { bytesToHumanSize } from '$lib/utils';
  import { byString } from '$lib/utils/sorting';
  import { getRelativeTime, getTimeDateString } from '$lib/utils/time';

  interface Props {
    build: Prisma.ProductBuildsGetPayload<{
      select: {
        Version: true;
        Success: true;
        BuildEngineBuildId: true;
        AppBuilderVersion: true;
      };
    }>;
    artifacts: Prisma.ProductArtifactsGetPayload<{
      select: {
        ArtifactType: true;
        FileSize: true;
        Url: true;
        DateUpdated: true;
      };
    }>[];
    release?: Prisma.ProductPublicationsGetPayload<{
      select: {
        Channel: true;
        Success: true;
        LogUrl: true;
        DateUpdated: true;
        DateResolved: true;
      };
    }>;
    latestBuildId: number | null | undefined;
    allowDownloads?: boolean;
  }

  let { build, artifacts, release, latestBuildId, allowDownloads = true }: Props = $props();
  const artifactUpdated = $derived(getRelativeTime(artifacts.map((a) => a.DateUpdated)));

  function versionString(b: typeof build): string {
    let version = b.Version;
    if (version === null) {
      if (b.Success === false) {
        version = ` ${m.projects_buildFailed()} `;
      } else {
        version = ` ${m.projects_buildPending()} `;
      }
    }

    if (b.BuildEngineBuildId === latestBuildId) {
      return m.projects_latestBuild({ version });
    }
    return version;
  }
</script>

<div class="rounded-md border border-slate-400 w-full my-2">
  <div class="bg-neutral p-2 flex flex-row flex-wrap rounded-t-md place-content-between">
    <span class="font-bold text-lg text-accent">
      {versionString(build)}
    </span>
    <span class="ml-2 text-lg grow opacity-75 hidden sm:inline">
      {m.projectTable_appBuilderVersion()}:&nbsp;{build.AppBuilderVersion ?? '-'}
    </span>
    <span class="ml-2">
      {m.products_numArtifacts({ amount: artifacts.length })}
    </span>
    <span class="text-lg opacity-75 sm:hidden">
      {m.projectTable_appBuilderVersion()}:&nbsp;{build.AppBuilderVersion ?? '-'}
    </span>
  </div>
  <div class="p-2 overflow-x-auto">
    {#if !artifacts.length}
      {m.products_numArtifacts({ amount: 0 })}
    {:else}
      {@const locale = getLocale()}
      <table class="table table-auto bg-base-100">
        <thead>
          <tr>
            <th>{m.products_filename()}</th>
            <th>{m.products_updated()}</th>
            <th class="text-right">{m.products_size()}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each artifacts.toSorted( (a, b) => byString(a.ArtifactType, b.ArtifactType, locale) ) as artifact, i}
            <tr>
              <td><IconContainer icon="mdi:file" width="20" /> {artifact.ArtifactType}</td>
              <td>
                <Tooltip tip={getTimeDateString(artifact.DateUpdated)}>
                  {$artifactUpdated[i]}
                </Tooltip>
              </td>
              <td class="text-right">{bytesToHumanSize(artifact.FileSize)}</td>
              {#if allowDownloads}
                <td class="text-right">
                  <a href={artifact.Url} download>
                    <IconContainer icon="mdi:download" width="20" />
                  </a>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
  <div class="p-2"><ReleaseInfo {release} /></div>
</div>

<style>
  tr > th:first-child,
  tr > td:first-child {
    position: sticky;
    left: 0;
    z-index: 0;
  }
  tr > th:not(:first-child),
  tr > td:not(:first-child) {
    position: sticky;
    left: 0;
    z-index: 1;
  }

  tr td,
  tr th {
    background-color: var(--color-base-100);
  }
</style>

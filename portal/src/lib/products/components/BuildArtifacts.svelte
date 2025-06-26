<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { bytesToHumanSize } from '$lib/utils';
  import { byString } from '$lib/utils/sorting';
  import { getRelativeTime } from '$lib/utils/time';
  import type { Prisma } from '@prisma/client';

  interface Props {
    build: Prisma.ProductBuildsGetPayload<{
      select: {
        Version: true;
        Success: true;
        BuildId: true;
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
      };
    }>;
    latestBuildId: number | undefined;
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

    if (b.BuildId === latestBuildId) {
      return m.projects_latestBuild({ version });
    }
    return version;
  }
</script>

<div class="rounded-md border border-slate-400 w-full my-2">
  <div class="bg-neutral p-2 flex flex-row rounded-t-md place-content-between">
    <span class="font-bold text-lg text-accent grow">
      {versionString(build)}
    </span>
    <span>
      {m.products_numArtifacts({ amount: artifacts.length })}
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
                <Tooltip tip={artifact.DateUpdated?.toLocaleString(locale)}>
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
    {#if release?.LogUrl}
      <table class="table table-auto bg-base-100">
        <thead>
          <tr>
            <th>{m.publications_channel()}</th>
            <th>{m.publications_status()}</th>
            <th>{m.publications_date()}</th>
            <!-- Are we sure this is the i18n we want??? -->
            <th>{m.publications_url()}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{release.Channel}</td>
            <td>
              {release.Success ? m.publications_succeeded() : m.publications_failed()}
            </td>
            <td>{release.DateUpdated?.toLocaleDateString(getLocale())}</td>
            <td>
              <a href={release.LogUrl} class="link">{m.publications_console()}</a>
            </td>
          </tr>
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  tr > th:first-child,
  tr > td:first-child {
    position: sticky;
    left: 0;
  }

  tr td,
  tr th {
    background-color: var(--color-base-100);
  }
</style>

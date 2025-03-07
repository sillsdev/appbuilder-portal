<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { getRelativeTime } from '$lib/timeUtils';
  import { bytesToHumanSize } from '$lib/utils';


  interface Props {
    build: {
    Version: string | null;
    Success: boolean | null;
    BuildId: number;
    ProductArtifacts: {
      ArtifactType: string | null;
      FileSize: bigint | null;
      Url: string | null;
      DateUpdated: Date | null;
    }[];
    ProductPublications: {
      Channel: string | null;
      Success: boolean | null;
      LogUrl: string | null;
      DateUpdated: Date | null;
    }[];
  };
    latestBuildId: number | undefined;
  }

  let { build, latestBuildId }: Props = $props();

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
    } else {
      const matches = message.match(/other *\{(.*?)\{ amount \}(.*?)\}/);
      return `${matches![1]}${amount}${matches![2]}`;
    }
  }
</script>

<div class="rounded-md border border-slate-400 w-full my-2">
  <div class="bg-neutral p-2 flex flex-row rounded-t-md place-content-between">
    <span class="font-bold text-lg text-accent grow">
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
      {@const langTag = languageTag()}
      <table class="table table-auto bg-base-100">
        <thead>
          <tr>
            <th>{m.project_products_filename()}</th>
            <th>{m.project_products_updated()}</th>
            <th class="text-right">{m.project_products_size()}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each build.ProductArtifacts as artifact}
            <tr>
              <td><IconContainer icon="mdi:file" width="20" /> {artifact.ArtifactType}</td>
              <td>
                <Tooltip
                  tip={artifact.DateUpdated?.toLocaleString(langTag)}
                >
                  {getRelativeTime(artifact.DateUpdated)}
                </Tooltip>
              </td>
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
    {#if build.ProductPublications.at(0)?.LogUrl}
      {@const pub = build.ProductPublications[0]}
      <table class="table table-auto bg-base-100">
        <thead>
          <tr>
            <th>{m.project_products_publications_channel()}</th>
            <th>{m.project_products_publications_status()}</th>
            <th>{m.project_products_publications_date()}</th>
            <!-- Are we sure this is the i18n we want??? -->
            <th>{m.project_products_publications_url()}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{pub.Channel}</td>
            <td>
              {pub.Success
                ? m.project_products_publications_succeeded()
                : m.project_products_publications_failed()}
            </td>
            <td>{pub.DateUpdated?.toLocaleDateString(languageTag())}</td>
            <td>
              <a href={pub.LogUrl} class="link">{m.project_products_publications_console()}</a>
            </td>
          </tr>
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

<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { m } from '$lib/paraglide/messages';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    release?: Prisma.ProductPublicationsGetPayload<{
      select: {
        Channel: true;
        Success: true;
        LogUrl: true;
        DateUpdated: true;
        DateResolved: true;
      };
    }>;
    classes?: string;
    headerClasses?: string;
  }

  let { release, classes = '', headerClasses = '' }: Props = $props();
</script>

{#if release?.LogUrl}
  <table class="table table-auto bg-base-100 {classes}">
    <thead class={headerClasses}>
      <tr>
        <th>{m.publications_channel()}</th>
        <th>{m.publications_status()}</th>
        {#if release.DateResolved}
          <th>{m.publications_resolved()}</th>
        {/if}
        <th>{m.publications_date()}</th>
        <th>{m.publications_url()}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{release.Channel}</td>
        <td>
          {release.Success ? m.publications_succeeded() : m.publications_failed()}
        </td>
        {#if release.DateResolved}
          <td>{getTimeDateString(release.DateResolved)}</td>
        {/if}
        <td>{getTimeDateString(release.DateUpdated)}</td>
        <td>
          <a href={release.LogUrl} class="link">{m.publications_console()}</a>
        </td>
      </tr>
    </tbody>
  </table>
{/if}

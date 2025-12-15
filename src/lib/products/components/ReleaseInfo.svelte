<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { ClassValue } from 'svelte/elements';
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
    class?: {
      default?: ClassValue;
      header?: ClassValue;
    };
  }

  let { release, class: classes }: Props = $props();
</script>

{#if release?.LogUrl}
  <table class={['table table-auto bg-base-100 sm:hidden', classes?.default]}>
    <tbody>
      <tr>
        <th class={[classes?.header]}>{m.publications_channel()}</th>
        <td>{release.Channel}</td>
      </tr>
      <tr>
        <th class={[classes?.header]}>{m.publications_status()}</th>
        <td>
          {release.Success ? m.publications_succeeded() : m.publications_failed()}
        </td>
      </tr>
      {#if release.DateResolved}
        <tr>
          <th class={[classes?.header]}>{m.publications_resolved()}</th>
          <td>{getTimeDateString(release.DateResolved)}</td>
        </tr>
      {/if}
      <tr>
        <th class={[classes?.header]}>{m.publications_date()}</th>
        <td>{getTimeDateString(release.DateUpdated)}</td>
      </tr>
      <tr>
        <th class={[classes?.header]}>{m.publications_url()}</th>
        <td>
          <a href={release.LogUrl} class="link" target="_blank">{m.publications_console()}</a>
        </td>
      </tr>
    </tbody>
  </table>
  <table class="hidden sm:table table-auto bg-base-100 {classes}">
    <thead class={[classes?.header]}>
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
          <a href={release.LogUrl} class="link" target="_blank">{m.publications_console()}</a>
        </td>
      </tr>
    </tbody>
  </table>
{/if}

<style>
  .sm\:hidden > tbody > tr > th {
    opacity: 60%;
  }
</style>

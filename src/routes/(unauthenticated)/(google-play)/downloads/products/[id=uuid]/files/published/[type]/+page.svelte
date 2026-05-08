<script lang="ts">
  import type { PageData } from './$types';
  import LocaleSelector from '$lib/google-play/components/LocaleSelector.svelte';
  import { m } from '$lib/google-play/paraglide/messages';
  import type { Locale } from '$lib/google-play/paraglide/runtime';
  import { bytesToHumanSize } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="mx-auto text-left w-full md:max-w-2/3 p-2 px-12">
  <div class="flex flex-row pb-2">
    <h3 class="pl-0 grow">{m.downloads_title()}</h3>
    <LocaleSelector current={data.locale as Locale} l10nMap={data.l10nMap} />
  </div>

  <div class="flex flex-row w-full">
    <a href={data.product.Url} download target="_blank" class="w-1/2 link no-underline">
      {data.product.ArtifactType?.toUpperCase()}
    </a>

    <span class="w-1/2">
      {bytesToHumanSize(
        data.headers['Content-Length'] ? BigInt(data.headers['Content-Length']) : null
      )}
    </span>
  </div>
</div>

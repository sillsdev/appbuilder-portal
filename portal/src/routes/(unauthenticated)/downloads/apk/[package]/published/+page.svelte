<script lang="ts">
  import { bytesToHumanSize } from '$lib/utils';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let lang = $state('');

  onMount(() => {
    lang = window.navigator.language;
    const languages = data.manifest.languages;
    if (!languages.includes(lang)) {
      lang = data.manifest['default-language'];
    }
  });

  function downloadLinkText(manifest: (typeof data)['manifest'], lang: string) {
    const langOnlyNoVariant = lang.substring(0, 2);
    const strings = manifest['download-apk-strings'];
    return strings[langOnlyNoVariant] || strings['en'];
  }
</script>

<div class="flex flex-col h-full items-center justify-center">
  <div class="flex flex-col h-full items-center justify-center">
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={data.manifest.icon} />

    <h3>{data.manifest.titles[lang]}</h3>
    <p class="text-center w-70">{data.manifest.descriptions[lang]}</p>

    <span class="my-8">
      {bytesToHumanSize(data.manifest.size ? BigInt(data.manifest.size) : null)}
    </span>

    <a
      href={data.manifest.link}
      download
      target="_blank"
      class="btn"
      style="backgroundColor: {data.manifest.color}"
    >
      {downloadLinkText(data.manifest, lang)}
    </a>
  </div>
</div>

<style>
  img {
    max-height: 128px;
    max-width: 128px;
  }
</style>

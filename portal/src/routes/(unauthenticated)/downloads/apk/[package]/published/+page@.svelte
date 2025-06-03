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

  /**
   * This will return NaN if there are any issues.
   * Since we are just checking whether greater or less than 0.5, should be fine.
   */
  function lightness(rgb: string): number {
    const r = parseInt(rgb.substring(0, 2), 16) / 255;
    const g = parseInt(rgb.substring(2, 4), 16) / 255;
    const b = parseInt(rgb.substring(4, 6), 16) / 255;
    return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
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
      class="btn {lightness(data.manifest.color.substring(1 /*ignore #*/)) < 0.5
        ? 'text-white'
        : 'text-black'}"
      style="background-color: {data.manifest.color}"
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

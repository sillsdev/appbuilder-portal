<script lang="ts">
  import type { PageData } from './$types';
  import LocaleSelector from '$lib/components/LocaleSelector.svelte';
  import { GooglePlayFlags } from '$lib/google-play';
  import { type Locale, setLocale } from '$lib/google-play/paraglide/runtime';
  import { Icons, getFlagIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { bytesToHumanSize } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

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

  const current = $derived(data.manifest.language as Locale);
</script>

<div class="flex flex-col h-full items-center justify-center">
  <div class="p-2 flex flex-row w-full justify-end">
    <LocaleSelector
      getLocale={() => current}
      {setLocale}
      l10nMap={data.l10nMap}
      locales={data.manifest.languages as Locale[]}
      flagMap={GooglePlayFlags}
      class={{ dropdown: 'dropdown-end', label: 'border-secondary pe-1' }}
    >
      {#snippet label(displayNames)}
        {@const { display, fallback } = displayNames.get(current) ?? {}}
        <div class="flex flex-row py-1 w-full items-start h-full gap-1">
          <IconContainer icon={getFlagIcon(current, GooglePlayFlags)} width={24} />
          <span class="flex flex-col text-start grow">
            <span>
              {display}
              {#if display !== fallback}
                &ndash; {current}
              {/if}
            </span>
          </span>
          <span class="h-full flex flex-row items-center">
            <IconContainer icon={Icons.Dropdown} width={20} />
          </span>
        </div>
      {/snippet}
    </LocaleSelector>
  </div>
  <div class="flex flex-col h-full items-center justify-center">
    <!-- svelte-ignore a11y_missing_attribute -->
    <img src={data.manifest.icon} />

    <h3>{data.manifest['title.txt']}</h3>
    <p class="text-center w-70">{data.manifest['short_description.txt']}</p>

    <span class="my-8">
      {bytesToHumanSize(data.manifest.size ? BigInt(data.manifest.size) : null)}
    </span>

    <a
      href={data.manifest.link}
      download
      target="_blank"
      class={[
        'btn',
        lightness(data.manifest.color.substring(1 /*ignore #*/)) < 0.5 ? 'text-white' : 'text-black'
      ]}
      style="background-color: {data.manifest.color}"
    >
      {data.manifest.downloadTitle}
    </a>
  </div>
</div>

<style>
  img {
    max-height: 128px;
    max-width: 128px;
  }
</style>

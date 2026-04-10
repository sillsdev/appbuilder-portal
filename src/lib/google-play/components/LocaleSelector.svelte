<script lang="ts">
  import LocaleSelector from '$lib/components/LocaleSelector.svelte';
  import { GooglePlayFlags } from '$lib/google-play';
  import {
    type Locale,
    locales as allLocales,
    setLocale
  } from '$lib/google-play/paraglide/runtime';
  import { Icons, getFlagIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import type { L10NMap } from '$lib/ldml';

  interface Props {
    current: Locale;
    locales?: Readonly<Locale[]>;
    l10nMap: L10NMap<Locale>;
  }

  let { current, locales = allLocales, l10nMap }: Props = $props();
</script>

<LocaleSelector
  getLocale={() => current}
  {setLocale}
  {l10nMap}
  {locales}
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

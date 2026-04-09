<script lang="ts">
  import type { PageData } from './$types';
  import { AlternateCodes, GooglePlayFlags } from '$lib/google-play';
  import { getLocale, locales, setLocale } from '$lib/google-play/paraglide/runtime';
  import { getFlagIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { tryLocalize } from '$lib/ldml';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const current = $derived(getLocale());

  const displayNames = $derived(
    new Map(
      locales.map((locale) => {
        const fallback = data.fallbacks.get(locale) ?? locale;
        const altLocale = AlternateCodes.get(locale);
        const localized = tryLocalize(data.l10nMap, current, 'languages', locale, fallback);
        const native = tryLocalize(data.l10nMap, locale, 'languages', locale, fallback);
        const displayLocal = altLocale
          ? localized === fallback
            ? tryLocalize(data.l10nMap, current, 'languages', altLocale, fallback)
            : localized
          : localized;
        const displayNative = altLocale
          ? native === fallback
            ? tryLocalize(data.l10nMap, locale, 'languages', altLocale, fallback)
            : native
          : native;
        return [locale, { display: displayLocal, native: displayNative, fallback }];
      })
    )
  );
</script>

<div class="flex flex-row flex-wrap gap-2 justify-center p-2">
  {#each locales.toSorted( (a, b) => byString(displayNames.get(a)?.display, displayNames.get(b)?.display, current) ) as locale}
    {@const { display, native, fallback } = displayNames.get(locale)!}
    <div
      class={[
        'btn flex-nowrap justify-start pl-2 pr-1 h-auto min-w-2xs',
        locale === current ? 'btn-accent' : 'btn-ghost border-secondary'
      ]}
      onclick={() => setLocale(locale)}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setLocale(locale);
        }
      }}
      role="button"
      tabindex="0"
    >
      <div class="flex flex-col py-1 w-full items-start">
        <span>
          <IconContainer icon={getFlagIcon(locale, GooglePlayFlags)} width={24} />
          <span class="grow text-left">
            {display}
            {#if display !== fallback}
              &ndash; {locale}
            {/if}
          </span>
        </span>
        {#if current !== locale && native !== fallback}
          <i class="ps-8 opacity-80 text-left">{native}</i>
        {/if}
      </div>
    </div>
  {/each}
</div>

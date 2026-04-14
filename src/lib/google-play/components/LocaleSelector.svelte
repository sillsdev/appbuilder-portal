<script lang="ts">
  import Dropdown from '$lib/components/Dropdown.svelte';
  import { AlternateCodes, GooglePlayFlags } from '$lib/google-play';
  import {
    type Locale,
    locales as allLocales,
    setLocale
  } from '$lib/google-play/paraglide/runtime';
  import { Icons, getFlagIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { type L10NMap, tryLocalize } from '$lib/ldml';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    current: Locale;
    onselect?: (lang: Locale) => void;
    l10nMap: L10NMap<Locale>;
    locales?: Readonly<Locale[]>;
    fallbacks?: ReadonlyMap<string, string>;
  }

  let { current, onselect = setLocale, l10nMap, locales = allLocales, fallbacks }: Props = $props();

  let open = $state(false);

  function onclick(locale: Locale) {
    open = false;
    onselect(locale);
  }

  const displayNames = $derived(
    new Map(
      locales.map((locale) => {
        const fallback = fallbacks?.get(locale) ?? locale;
        const altLocale = AlternateCodes.get(locale as Locale);
        const localized = tryLocalize(l10nMap, current, 'languages', locale, fallback);
        const native = tryLocalize(l10nMap, locale, 'languages', locale, fallback);
        const displayLocal = altLocale
          ? localized === fallback
            ? tryLocalize(l10nMap, current, 'languages', altLocale, fallback)
            : localized
          : localized;
        const displayNative = altLocale
          ? native === fallback
            ? tryLocalize(l10nMap, locale, 'languages', altLocale, fallback)
            : native
          : native;
        return [locale, { display: displayLocal, native: displayNative, fallback }];
      })
    )
  );
</script>

{#key current}
  <Dropdown
    class={{
      dropdown: 'dropdown-end',
      label: 'border-secondary pe-1',
      content: 'max-h-64 overflow-y-auto'
    }}
    bind:open
  >
    {#snippet label()}
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
    {#snippet content()}
      <ul class="menu menu-sm gap-1 p-2">
        {#each locales.toSorted( (a, b) => byString(displayNames.get(a)?.display, displayNames.get(b)?.display, current) ) as locale}
          {@const { display, native, fallback } = displayNames.get(locale)!}
          <li class="w-full">
            <div
              class={[
                'btn flex-nowrap justify-start pl-2 pr-1 h-auto min-w-2xs',
                locale === current ? 'btn-accent' : 'btn-ghost'
              ]}
              onclick={() => onclick(locale)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onclick(locale);
                }
              }}
              role="button"
              tabindex="0"
            >
              <div class="flex flex-row py-1 w-full items-start h-full gap-1">
                <IconContainer icon={getFlagIcon(locale, GooglePlayFlags)} width={24} />
                <span class="flex flex-col text-start grow">
                  <span>
                    {display}
                    {#if display !== fallback}
                      &ndash; {locale}
                    {/if}
                  </span>
                  {#if native !== display && native !== fallback}
                    <i class="opacity-80">{native}</i>
                  {/if}
                </span>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {/snippet}
  </Dropdown>
{/key}

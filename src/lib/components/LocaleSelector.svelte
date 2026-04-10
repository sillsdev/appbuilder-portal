<script lang="ts" generics="Locale extends string">
  import type { Snippet } from 'svelte';
  import IconContainer from '../icons/IconContainer.svelte';
  import Dropdown, { type DropdownClasses } from './Dropdown.svelte';
  import { AlternateCodes } from '$lib/google-play';
  import type { Locale as GPLocale } from '$lib/google-play/paraglide/runtime';
  import { Icons, getFlagIcon } from '$lib/icons';
  import { type L10NMap, tryLocalize } from '$lib/ldml';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    label?: Snippet<[typeof displayNames]>;
    class?: DropdownClasses;
    getLocale: () => Locale;
    setLocale: (lang: Locale) => void;
    l10nMap: L10NMap<Locale>;
    locales: Readonly<Locale[]>;
    flagMap: ReadonlyMap<Locale, string>;
    fallbacks?: ReadonlyMap<string, string>;
  }

  let {
    label: _label = defaultLabel,
    class: classes = {},
    getLocale,
    setLocale,
    l10nMap,
    locales,
    flagMap,
    fallbacks
  }: Props = $props();

  let open = $state(false);

  function onclick(locale: Locale) {
    open = false;
    setLocale(locale);
  }

  const current = $derived(getLocale());

  const displayNames = $derived(
    new Map(
      locales.map((locale) => {
        const fallback = fallbacks?.get(locale) ?? locale;
        const altLocale = AlternateCodes.get(locale as GPLocale);
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

{#snippet defaultLabel()}
  <IconContainer icon={Icons.Language} width={24} />
{/snippet}

{#key getLocale()}
  {@const current = getLocale()}
  <Dropdown
    class={{
      ...classes,
      content: ['max-h-64 overflow-y-auto', classes.content]
    }}
    bind:open
  >
    {#snippet label()}
      {@render _label(displayNames)}
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
                <IconContainer icon={getFlagIcon(locale, flagMap)} width={24} />
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

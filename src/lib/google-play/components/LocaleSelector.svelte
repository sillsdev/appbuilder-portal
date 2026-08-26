<script lang="ts">
  import Dropdown, { type DropdownClasses } from '$lib/components/Dropdown.svelte';
  import { GooglePlayFlags } from '$lib/google-play';
  import { m } from '$lib/google-play/paraglide/messages';
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
    class?: DropdownClasses;
    current: Locale;
    onselect?: (lang: Locale) => void;
    l10nMap: L10NMap<Locale>;
    locales?: Readonly<Locale[]>;
    fallbacks?: ReadonlyMap<string, string>;
  }

  let {
    class: classes,
    current,
    onselect = setLocale,
    l10nMap,
    locales = allLocales,
    fallbacks
  }: Props = $props();

  let open = $state(false);
  // Start expanded when the active locale isn't part of the curated set
  // (e.g. reached via a direct link), so it stays visible and selected.
  // This is only an initial default — the user can still toggle it freely.
  let showAll = $state(!locales.includes(current));

  function onclick(locale: Locale) {
    open = false;
    onselect(locale);
  }

  const hasMore = $derived(locales.length < allLocales.length);
  const shownLocales = $derived(showAll ? allLocales : locales);

  const displayNames = $derived(
    new Map(
      shownLocales.map((locale) => {
        const fallback = fallbacks?.get(locale) ?? locale;
        return [
          locale,
          {
            display: tryLocalize(l10nMap, current, 'languages', locale, fallback),
            native: tryLocalize(l10nMap, locale, 'languages', locale, fallback),
            fallback
          }
        ];
      })
    )
  );
</script>

{#key current}
  <Dropdown
    class={{
      dropdown: ['dropdown-end', classes?.dropdown],
      label: ['pe-1 ps-2', classes?.label],
      content: [showAll ? 'max-h-128' : 'max-h-64', 'overflow-y-auto', classes?.content]
    }}
    bind:open
  >
    {#snippet label()}
      <div class="flex flex-row py-1 w-full items-center h-full gap-1">
        <IconContainer icon={getFlagIcon(current, GooglePlayFlags)} width={24} />
        <span class="h-full flex flex-row items-center">
          <IconContainer icon={Icons.Dropdown} width={20} />
        </span>
      </div>
    {/snippet}
    {#snippet content()}
      <ul class="menu menu-sm gap-1 p-2">
        {#each shownLocales.toSorted( (a, b) => byString(displayNames.get(a)?.display, displayNames.get(b)?.display, current) ) as locale}
          {@const { display, native, fallback } = displayNames.get(locale)!}
          <li class="w-full">
            <button
              type="button"
              class={[
                'btn flex-nowrap justify-start pl-2 pr-1 h-auto min-w-2xs',
                locale === current ? 'btn-accent' : 'btn-ghost'
              ]}
              onclick={() => onclick(locale)}
            >
              <div class="flex flex-row py-1 w-full items-center h-full gap-1 leading-4">
                <IconContainer
                  icon={getFlagIcon(locale, GooglePlayFlags)}
                  width={24}
                  class="me-1"
                />
                <span class="flex flex-col text-start grow">
                  <span>
                    {display}
                  </span>
                  {#if native !== display && native !== fallback}
                    <i class="opacity-80">{native}</i>
                  {/if}
                </span>
              </div>
            </button>
          </li>
        {/each}
        {#if hasMore}
          <li class="w-full">
            <button
              type="button"
              class="btn btn-ghost flex-nowrap justify-start pl-2 pr-1 h-auto min-w-2xs"
              onclick={(e) => {
                e.stopPropagation();
                showAll = !showAll;
              }}
            >
              {showAll ? m.show_less() : m.show_more()}
            </button>
          </li>
        {/if}
      </ul>
    {/snippet}
  </Dropdown>
{/key}

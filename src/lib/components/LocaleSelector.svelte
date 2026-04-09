<script lang="ts" generics="Locale extends string">
  import type { Snippet } from 'svelte';
  import IconContainer from '../icons/IconContainer.svelte';
  import Dropdown, { type DropdownClasses } from './Dropdown.svelte';
  import { Icons, getFlagIcon } from '$lib/icons';
  import { type L10NMap, tryLocalize } from '$lib/ldml';

  interface Props {
    label?: Snippet;
    class?: DropdownClasses;
    getLocale: () => Locale;
    setLocale: (lang: Locale) => void;
    l10nMap: L10NMap<Locale>;
    locales: Readonly<Locale[]>;
    flagMap: ReadonlyMap<Locale, string>;
  }

  let {
    label = defaultLabel,
    class: classes = {},
    getLocale,
    setLocale,
    l10nMap,
    locales,
    flagMap
  }: Props = $props();

  let open = $state(false);

  function onclick(locale: Locale) {
    open = false;
    setLocale(locale);
  }
</script>

{#snippet defaultLabel()}
  <IconContainer icon={Icons.Language} width={24} />
{/snippet}

{#key getLocale()}
  {@const current = getLocale()}
  <Dropdown
    class={{
      ...classes,
      content: ['overflow-y-auto min-w-52', classes.content]
    }}
    bind:open
    {label}
  >
    {#snippet content()}
      <ul class="menu menu-sm gap-1 p-2">
        {#each locales as locale}
          <li class="w-full">
            <div
              class={[
                'btn flex-nowrap justify-start pl-2 pr-1',
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
              <IconContainer icon={getFlagIcon(locale, flagMap)} width="24" />
              <span class="grow text-left">
                {tryLocalize(l10nMap, current, 'languages', locale, locale)}
              </span>
            </div>
          </li>
        {/each}
      </ul>
    {/snippet}
  </Dropdown>
{/key}

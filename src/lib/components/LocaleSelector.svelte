<script lang="ts">
  import type { Snippet } from 'svelte';
  import Dropdown, { type DropdownClasses } from './Dropdown.svelte';
  import { DefaultFlags, Icons, getFlagIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { type L10NMap, tryLocalize } from '$lib/ldml';
  import { type Locale, getLocale, locales, setLocale } from '$lib/paraglide/runtime';

  interface Props {
    label?: Snippet;
    class?: DropdownClasses;
    currentLocale?: () => Locale;
    onselect?: (lang: Locale) => void;
    l10nMap: L10NMap<Locale>;
  }

  let {
    label = defaultLabel,
    class: classes = {},
    currentLocale = getLocale,
    onselect = setLocale,
    l10nMap
  }: Props = $props();

  let open = $state(false);

  function onclick(locale: Locale) {
    open = false;
    onselect(locale);
  }

  const current = $derived(currentLocale());
</script>

{#snippet defaultLabel()}
  <IconContainer icon={Icons.Language} width={24} />
{/snippet}

{#key current}
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
              <IconContainer icon={getFlagIcon(locale, DefaultFlags)} width="24" />
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

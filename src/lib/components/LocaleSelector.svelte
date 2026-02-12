<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconContainer from '../icons/IconContainer.svelte';
  import Dropdown, { type DropdownClasses } from './Dropdown.svelte';
  import { Icons, getFlagIcon } from '$lib/icons';
  import { l10nMap } from '$lib/locales.svelte';
  import { type Locale, getLocale, locales, setLocale } from '$lib/paraglide/runtime';

  interface Props {
    label?: Snippet;
    class?: DropdownClasses;
    currentLocale?: () => Locale;
    onselect?: (lang: Locale) => void;
  }

  let {
    label = defaultLabel,
    class: classes = {},
    currentLocale = getLocale,
    onselect = setLocale
  }: Props = $props();

  let open = $state(false);

  function onclick(locale: Locale) {
    open = false;
    onselect?.(locale);
  }
</script>

{#snippet defaultLabel()}
  <IconContainer icon={Icons.Language} width={24} />
{/snippet}

{#key getLocale()}
  {@const langMap = l10nMap.value.get(getLocale())?.get('languages')}
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
                locale === currentLocale() ? 'btn-accent' : 'btn-ghost'
              ]}
              onclick={() => onclick(locale)}
              onkeypress={() => onclick(locale)}
              role="button"
              tabindex="0"
            >
              <IconContainer icon={getFlagIcon(locale)} width="24" />
              <span class="grow text-left">
                {langMap?.get(locale) ?? langMap?.get(locale.split('-')[0])}
              </span>
            </div>
          </li>
        {/each}
      </ul>
    {/snippet}
  </Dropdown>
{/key}

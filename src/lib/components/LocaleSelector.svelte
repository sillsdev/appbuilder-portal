<script lang="ts" module>
  export function getFlag(locale: Locale) {
    switch (locale) {
      case 'en-US':
        return 'us';
      case 'es-419':
        return 'mx';
      case 'fr-FR':
        return 'fr';
      default:
        console.warn(`Unrecognized language tag ${locale} in getFlag, using default flag.`);
        return 'un'; // UN flag as fallback
    }
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import Dropdown from './Dropdown.svelte';
  import IconContainer from './IconContainer.svelte';
  import { l10nMap } from '$lib/locales.svelte';
  import { type Locale, getLocale, locales, setLocale } from '$lib/paraglide/runtime';

  interface Props {
    label?: Snippet;
    class?: {
      dropdown?: ClassValue;
      label?: ClassValue;
    };
    currentLocale?: () => Locale;
    onselect?: (lang: Locale) => void;
  }

  let {
    label = globe,
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

{#snippet globe()}
  <IconContainer icon="mdi:language" width={28} />
{/snippet}

{#key getLocale()}
  {@const langMap = l10nMap.value.get(getLocale())?.get('languages')}
  <Dropdown
    class={{
      ...classes,
      content: 'overflow-y-auto min-w-52'
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
              <IconContainer icon="circle-flags:{getFlag(locale)}" width="24" />
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

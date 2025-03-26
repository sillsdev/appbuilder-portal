<script lang="ts">
  import { LanguageIcon } from '$lib/icons';
  import { l10nMap } from '$lib/locales.svelte';
  import { getLocale, locales, setLocale, type Locale } from '$lib/paraglide/runtime';
  import Dropdown from './Dropdown.svelte';
  import IconContainer from './IconContainer.svelte';

  function getFlag(locale: Locale) {
    switch (locale) {
      case 'en-US':
        return 'us';
      case 'es-419':
        return 'mx';
      case 'fr-FR':
        return 'fr';
      default:
        throw new Error(`Unrecognized language tag ${locale} in getFlag!`);
    }
  }
</script>

{#key getLocale()}
  <Dropdown
    dropdownClasses="dropdown-end"
    labelClasses="m-2 p-2 rounded-xl items-middle justify-center flex-nowrap"
    contentClasses="overflow-y-auto"
  >
    {#snippet label()}
      <LanguageIcon color="white" />
    {/snippet}
    {#snippet content()}
      <ul class="menu menu-compact gap-1 p-2">
        {#each locales as locale}
          {@const langMap = l10nMap.value.get(getLocale())?.get('languages')}
          <li class="w-full">
            <div
              class="btn flex-nowrap justify-start"
              class:bg-accent={locale === getLocale()}
              class:text-accent-content={locale === getLocale()}
              onclick={() => setLocale(locale)}
              onkeypress={() => setLocale(locale)}
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

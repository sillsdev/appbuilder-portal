<script lang="ts">
  import Icon from '@iconify/svelte';
  import { LanguageIcon } from '$lib/icons';
  import { _, locale, locales } from 'svelte-i18n';

  function setLocale(lang: string | null | undefined): undefined {
    locale.set(lang);
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem?.blur();
    }
    return;
  }

  function isActive(lang: string, current: string | null | undefined) {
    if (lang === current?.substring(0, 2)) {
      return 'active';
    } else {
      return 'inactive';
    }
  }
</script>

{#key $_('lang')}
  <div class="dropdown dropdown-end">
    <!-- When .dropdown is focused, .dropdown-content is revealed making this actually interactive -->
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div
      class="btn btn-ghost m-2 p-2 rounded-xl items-middle justify-center flex-nowrap"
      tabindex="0"
    >
      <LanguageIcon color="white" />
    </div>
    <div class="dropdown-content z-10 bg-base-200 w-48 rounded-md overflow-y-auto">
      <ul class="menu menu-compact gap-1 p-2" tabindex="-1">
        {#each $locales as lang}
          <li>
            <div
              class="btn flex {isActive(lang, $locale)}"
              on:click={setLocale(lang)}
              on:keypress={setLocale(lang)}
              role="button"
              tabindex="0"
            >
              <Icon icon="circle-flags:{lang}" color="white" width="24" />
              {lang}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/key}

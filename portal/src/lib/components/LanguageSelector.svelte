<script lang="ts">
  import Icon from '@iconify/svelte';
  import { LanguageIcon } from '$lib/icons';
  import * as m from "$lib/paraglide/messages";
  import { languageTag, setLanguageTag, type AvailableLanguageTag } from '$lib/paraglide/runtime';
  import { i18n } from '$lib/i18n';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  function switchToLanguage(newLanguage: AvailableLanguageTag) {
    const canonicalPath = i18n.route($page.url.pathname);
    const localizedPath = i18n.resolveRoute(canonicalPath, newLanguage);
    goto(localizedPath);
  }
</script>

{#key languageTag()}
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
        {#each i18n.config.runtime.availableLanguageTags as lang}
          <li>
            <div
              class="btn flex {lang === languageTag() ? 'active' : 'inactive'}"
              on:click={() => switchToLanguage(lang)}
              on:keypress={() => switchToLanguage(lang)}
              role="button"
              tabindex="0"
            >
              <Icon icon="circle-flags:{lang.split("-")[0]}" color="white" width="24" />
              {lang.split("-")[0]}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/key}

<script lang="ts">
  import { LanguageIcon } from '$lib/icons';
  import { getLocale, locales, setLocale } from '$lib/paraglide/runtime';
  import Icon from '@iconify/svelte';
</script>

{#key getLocale()}
  <div class="dropdown dropdown-end">
    <div
      role="button"
      class="btn btn-ghost m-2 p-2 rounded-xl items-middle justify-center flex-nowrap"
      tabindex="0"
    >
      <LanguageIcon color="white" />
    </div>
    <div class="dropdown-content z-10 bg-base-200 w-48 rounded-md overflow-y-auto">
      <ul class="menu menu-compact gap-1 p-2" tabindex="-1">
        {#each locales as lang}
          <li>
            <div
              class="btn flex {lang === getLocale() ? 'active' : 'inactive'}"
              onclick={() => setLocale(lang)}
              onkeypress={() => setLocale(lang)}
              role="button"
              tabindex="0"
            >
              <Icon icon="circle-flags:{lang.split('-')[0]}" color="white" width="24" />
              {lang.split('-')[0]}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/key}

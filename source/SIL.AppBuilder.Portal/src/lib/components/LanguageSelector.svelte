<script lang="ts">
  import { LanguageIcon } from '$lib/icons';
  import { getLocale, locales, setLocale } from '$lib/paraglide/runtime';
  import Icon from '@iconify/svelte';
  import Dropdown from './Dropdown.svelte';
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
          <li>
            <div
              class="btn flex flex-nowrap {locale === getLocale() ? 'active' : 'inactive'}"
              onclick={() => setLocale(locale)}
              onkeypress={() => setLocale(locale)}
              role="button"
              tabindex="0"
            >
              <Icon icon="circle-flags:{locale.split('-')[0]}" color="white" width="24" />
              {locale.split('-')[0]}
            </div>
          </li>
        {/each}
      </ul>
    {/snippet}
  </Dropdown>
{/key}

<script lang="ts">
  import Fuse from 'fuse.js';

  import { page } from '$app/state';
  import {
    l10nMap,
    localizeTagData,
    type LangInfo
  } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import type { FuseResultMatch } from 'fuse.js';
  import TypeaheadInput from './TypeaheadInput.svelte';

  let langtagList = localizeTagData(page.data.langtags as LangInfo[], l10nMap.value, getLocale());

  // https://www.fusejs.io/api/options.html
  // Search the tag, name and localname. Give tag a double weighting
  // This seems very fast to me, but if it is found to be slow investigate providing an index at compile time
  const fuzzySearch = new Fuse(langtagList, {
    keys: [
      {
        name: 'tag',
        weight: 3
      },
      {
        name: 'nameInLocale',
        weight: 3
      },
      {
        name: 'name',
        weight: 2
      },
      {
        name: 'localname',
        weight: 2
      },
      // additional matches
      'region',
      'regions',
      'names',
      'variants'
    ],
    includeScore: true,
    includeMatches: true,
    isCaseSensitive: false,
    threshold: 0.6,
    ignoreLocation: true,
    ignoreFieldNorm: true
    // minMatchCharLength: 2
  });

  function search(searchValue: string) {
    return fuzzySearch.search(searchValue);
  }
  type FuseResult = ReturnType<typeof search>[number];

  // This could possibly be converted to an iterator/generator function?
  function parseMatches(
    value: string,
    matchList: readonly FuseResultMatch[],
    hasMultiCharMatch: boolean
  ) {
    let i = 0;
    const ret: {
      /**highlighted*/
      h: boolean;
      /**value*/
      v: string;
    }[] = [];
    for (let match of matchList) {
      for (let index of match.indices) {
        // Only show short matches (1-2 chars) if there are no longer ones
        if (index[1] - index[0] + 1 < 3 && hasMultiCharMatch) {
          ret.push({ h: false, v: value.substring(i, index[1] + 1) });
          i = index[1] + 1;
          continue;
        }
        ret.push({ h: false, v: value.substring(i, index[0]) });
        ret.push({ h: true, v: value.substring(index[0], index[1] + 1) });
        i = index[1] + 1;
      }
      ret.push({ h: false, v: value.substring(i) });
    }
    return ret;
  }
  let typeaheadInput: HTMLInputElement | undefined = $state(undefined);
  interface Props {
    langCode: string;
    dropdownClasses?: string;
    inputClasses?: string;
    onLangCodeSelected?: (langCode: string) => void;
  }

  let {
    langCode = $bindable(),
    dropdownClasses = '',
    inputClasses = '',
    onLangCodeSelected
  }: Props = $props();
</script>

{#snippet colorValueForKeyMatch(
  searchItem: FuseResult['item'],
  key: keyof FuseResult['item'],
  matches?: readonly FuseResultMatch[]
)}
  {@const value = searchItem[key]}
  {#if !matches}
    {value}
  {:else}
    {@const matchList = matches.filter((match) => match.key === key)}
    {#if !matchList.length}
      {value}
    {:else}
      {@const hasMultiCharMatch = matchList.some((match) =>
        // Note: match indices are inclusive (e.x. a match of indices [0, 2] indicates the
        // first three chars of a string) so we use +1 a lot to get the length of the match
        match.indices.some(([x, y]) => y - x + 1 > 2)
      )}
      {#each parseMatches(value!, matchList, hasMultiCharMatch) as match}
        {#if match.h}
          <span class="bg-yellow-300 dark:bg-accent">{match.v}</span>
        {:else}
          {match.v}
        {/if}
      {/each}
    {/if}
  {/if}
{/snippet}

<TypeaheadInput
  inputElProps={{ placeholder: m.project_languageCode() }}
  getList={(searchValue) => search(searchValue).slice(0, 5)}
  classes="pr-20 {inputClasses}"
  bind:search={langCode}
  onItemClicked={(res) => {
    langCode = res.item.tag;
    onLangCodeSelected?.(langCode);
  }}
  {dropdownClasses}
  bind:inputElement={typeaheadInput}
>
  <!-- This is a convenience option and unnecessary for a11y -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#snippet custom()}
    <span
      class="absolute right-4 italic [line-height:3rem]"
      onclick={() => typeaheadInput?.focus()}
    >
      {langtagList.find((l) => l.tag === langCode)?.nameInLocale ?? ''}
    </span>
  {/snippet}
  {#snippet listElement(res, selected)}
    {@const additionalMatch = res.matches
      ?.filter((match) => ['names', 'variants', 'region', 'regions'].includes(match.key ?? ''))
      .at(0)}
    {@const nameDiffersInLocale = res.item.localname !== res.item.nameInLocale}
    <div
      class="w-96 p-2 border border-b-0 border-neutral cursor-pointer flex flex-col place-content-between bg-base-100"
      class:selected
    >
      <div class="flex flex-row place-content-between">
        <!-- Debug -->
        <!-- <span class="absolute [right:-10rem] bg-black">{item.score}</span> -->
        <span class="mr-4">
          <b>
            {#if res.item.localname !== res.item.name}
              {@render colorValueForKeyMatch(res.item, 'localname', res.matches)}
            {:else}
              {@render colorValueForKeyMatch(res.item, 'name', res.matches)}
            {/if}
          </b>
          <br />
          {#if nameDiffersInLocale}
            <span class="text-base-content text-opacity-75 text-sm">
              {@render colorValueForKeyMatch(res.item, 'nameInLocale', res.matches)}
            </span>
          {/if}
        </span>
        <span class="w-16">
          <span>
            {@render colorValueForKeyMatch(res.item, 'tag', res.matches)}
          </span>
          <br />
          <span class="text-base-content text-opacity-75 text-sm">{m.localePicker_code()}</span>
        </span>
      </div>
      {#if additionalMatch && additionalMatch.key}
        <div class="flex-row justify-content-space-between mt-2">
          <div class="flex-col">
            <div class="text-base-content text-opacity-75 uppercase">
              <!-- TODO: i18n (requires pluralization) -->
              {additionalMatch.key}
            </div>
            <div class="line-clamp-1 max-w-80">
              {@render colorValueForKeyMatch(
                res.item,
                //@ts-expect-error the type is correct
                additionalMatch.key,
                res.matches
              )}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/snippet}
</TypeaheadInput>

<style>
  .selected {
    background-color: var(--color-base-200);
  }
</style>

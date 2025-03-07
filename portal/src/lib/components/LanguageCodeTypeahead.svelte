<script lang="ts">
  import Fuse from 'fuse.js';

  import langtags from '$lib/langtags.json';

  import * as m from '$lib/paraglide/messages';
  import type { FuseResultMatch } from 'fuse.js';
  import { createEventDispatcher } from 'svelte';
  import TypeaheadInput from './TypeaheadInput.svelte';

  // https://www.fusejs.io/api/options.html
  // Search the tag, name and localname. Give tag a double weighting
  // This seems very fast to me, but if it is found to be slow investigate providing an index at compile time
  const fuzzySearch = new Fuse(langtags, {
    keys: [
      {
        name: 'tag',
        weight: 2
      },
      'name',
      'localname'
    ],
    includeScore: true,
    includeMatches: true,
    isCaseSensitive: false,
    threshold: 0.6,
    ignoreLocation: true,
    ignoreFieldNorm: true
    // minMatchCharLength: 2
  });
  // This could possibly be converted to an iterator/generator function?
  function parseMatches(value: string, matchList: readonly FuseResultMatch[], hasMultiCharMatch: boolean) {
    let i = 0;
    const ret: {
      /**highlighted*/
      h: boolean,
      /**value*/
      v: string
    }[] = [];
    for (let match of matchList) {
      for (let index of match.indices) {
        // Only show short matches (1-2 chars) if there are no longer ones
        if (index[1] - index[0] + 1 < 3 && hasMultiCharMatch) {
          ret.push({h: false, v: value.substring(i, index[1] + 1)});
          i = index[1] + 1;
          continue;
        }
        ret.push({ h: false, v: value.substring(i, index[0])});
        ret.push({ h: true, v: value.substring(index[0], index[1] + 1)});
        i = index[1] + 1;
      }
      ret.push({ h: false, v: value.substring(i)});
    }
    return ret;
  }
  let langtagList = langtags;
  let typeaheadInput: HTMLInputElement | undefined = $state(undefined);
  interface Props {
    langCode: string;
    dropdownClasses?: string;
    inputClasses?: string;
  }

  let { langCode = $bindable(), dropdownClasses = '', inputClasses = '' }: Props = $props();

  const dispatch = createEventDispatcher<{
    langCodeSelected: string;
  }>();
</script>

{#snippet colorValueForKeyMatch(
  obj: Record<string, string>,
  key: string,
  matches?: readonly FuseResultMatch[]
)}
  {@const value = obj[key]}
  {#if !matches}
    {value}
  {:else}
    {@const matchList = matches.filter((match) => match.key === key)}
    {#if !matchList.length}
      {value}
    {:else}
      {@const hasMultiCharMatch = matches.some((match) =>
        // Note: match indices are inclusive (e.x. a match of indices [0, 2] indicates the
        // first three chars of a string) so we use +1 a lot to get the length of the match
        match.indices.some(([x, y]) => y - x + 1 > 2)
      )}
      <div><!--ret-->
        {#each parseMatches(value, matchList, hasMultiCharMatch) as match}
          {#if match.h}
            <span class="bg-yellow-300 dark:bg-accent">{match.v}</span>
          {:else}
            {match.v}
          {/if}
        {/each}
      </div>
    {/if}
  {/if}
{/snippet}

<TypeaheadInput
  inputElProps={{ placeholder: m.project_languageCode() }}
  getList={(search) => fuzzySearch.search(search).slice(0, 5)}
  classes="pr-20 {inputClasses}"
  bind:search={langCode}
  on:itemClicked={(item) => {
    langCode = item.detail.item.tag;
    dispatch('langCodeSelected', langCode);
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
      {langtagList.find((l) => l.tag === langCode)?.name ?? ''}
    </span>
  {/snippet}
  {#snippet listElement({ item })}
    <div
      class="w-96 p-2 border border-b-0 border-neutral listElement cursor-pointer flex flex-row place-content-between bg-base-100"
    >
      <!-- Debug -->
      <!-- <span class="absolute [right:-10rem] bg-black">{item.score}</span> -->
      <span class="mr-4">
        {#if item.item.localname}
          <b>
            {@render colorValueForKeyMatch(item.item, 'localname', item.matches)}
          </b>
          <br />
          <span class="text-sm">
            {@render colorValueForKeyMatch(item.item, 'name', item.matches)}
          </span>
        {:else}
          <b>
            {@render colorValueForKeyMatch(item.item, 'name', item.matches)}
          </b>
        {/if}
      </span>
      <span class="w-16">
        <span>
          {@render colorValueForKeyMatch(item.item, 'tag', item.matches)}
        </span>
        <br />
        <span class="text-base-content text-opacity-75 text-sm">{m.localePicker_code()}</span>
      </span>
    </div>
  {/snippet}
</TypeaheadInput>

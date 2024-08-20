<script lang="ts">
  import Fuse from 'fuse.js';

  import langtags from '$lib/langtags.json';

  import * as m from '$lib/paraglide/messages';
  import type { FuseResultMatch } from 'fuse.js';
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
  type FilterForStrings<T> = {
    [K in keyof T]: T[K] extends string ? K : never;
  }[keyof T];
  // TODO: Sanitize langtags
  function colorValueForKeyMatch<T extends object>(
    obj: T,
    key: FilterForStrings<T>,
    matches?: readonly FuseResultMatch[]
  ): string {
    const value = obj[key];
    if (typeof value !== 'string') throw new Error('Invalid object');
    if (!matches) return value;
    const matchList = matches.filter((match) => match.key === key);
    if (matchList.length === 0) return value;
    let ret = '';
    let i = 0;
    // Are there any matches of more than 2 characters?
    const hasMultiCharMatch = matches.some((match) =>
      // Note: match indices are inclusive (e.x. a match of indices [0, 2] indicates the
      // first three chars of a string) so we use +1 a lot to get the length of the match
      match.indices.some(([x, y]) => y - x + 1 > 2)
    );
    for (let match of matchList) {
      for (let index of match.indices) {
        // Only show short matches (1-2 chars) if there are no longer ones
        if (index[1] - index[0] + 1 < 3 && hasMultiCharMatch) {
          ret += value.substring(i, index[1] + 1);
          i = index[1] + 1;
          continue;
        }
        ret += value.substring(i, index[0]);
        ret += '<span class="highlight">';
        ret += value.substring(index[0], index[1] + 1);
        ret += '</span>';
        i = index[1] + 1;
      }
      ret += value.substring(i);
    }
    return ret;
  }
  let langtagList = langtags;
  let typeaheadInput: HTMLInputElement;
  export let langCode: string;
  export let dropdownClasses: string = '';
</script>

<TypeaheadInput
  props={{ placeholder: m.project_languageCode() }}
  getList={(search) => fuzzySearch.search(search).slice(0, 5)}
  classes="pr-20"
  bind:search={langCode}
  on:itemClicked={(item) => (langCode = item.detail.item.tag)}
  {dropdownClasses}
  bind:inputElement={typeaheadInput}
>
  <!-- This is a convenience option and unnecessary for a11y -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <span
    class="absolute right-4 italic [line-height:3rem]"
    slot="custom"
    on:click={() => typeaheadInput.focus()}
  >
    {langtagList.find((l) => l.tag === langCode)?.name ?? ''}
  </span>
  <div
    slot="listElement"
    class="w-96 p-2 border border-b-0 border-neutral listElement cursor-pointer flex flex-row place-content-between bg-base-100"
    let:item
  >
    <!-- Debug -->
    <!-- <span class="absolute [right:-10rem] bg-black">{item.score}</span> -->
    <span class="mr-4">
      {#if item.item.localname}
        <b>
          {@html colorValueForKeyMatch(item.item, 'localname', item.matches)}
        </b>
        <br />
        <span class="text-sm">
          {@html colorValueForKeyMatch(item.item, 'name', item.matches)}
        </span>
      {:else}
        <b>
          {@html colorValueForKeyMatch(item.item, 'name', item.matches)}
        </b>
      {/if}
    </span>
    <span class="w-16">
      <span>
        {@html colorValueForKeyMatch(item.item, 'tag', item.matches)}
      </span>
      <br />
      <span class="text-base-content text-opacity-75 text-sm">{m.localePicker_code()}</span>
    </span>
  </div>
</TypeaheadInput>

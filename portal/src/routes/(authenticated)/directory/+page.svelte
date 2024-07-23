<script lang="ts">
  import TypeaheadInput from '$lib/components/TypeaheadInput.svelte';
  import langtags from '$lib/langtags.json';
  import * as m from '$lib/paraglide/messages';
  import Fuse, { type FuseResultMatch } from 'fuse.js';
  import ProjectSelector from '../projects/components/ProjectSelector.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

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
  let langCode: string;
  let productDefinitionFilter: string;
  let organizationFilter: string;
</script>

<ProjectSelector
  projects={data.projects.filter((proj) => {
    return (
      (proj.Language ?? '').includes(langCode) &&
      (!productDefinitionFilter ||
        proj.Products.some((prod) => prod.ProductDefinitionName === productDefinitionFilter)) &&
      (!organizationFilter || proj.OrganizationName === organizationFilter)
    );
  })}
>
  <h1 slot="header" class="p-4 pl-6">{m.sidebar_projectDirectory()}</h1>
  <div
    slot="options"
    class="w-full flex flex-row place-content-start p-4 pb-0 px-6 space-between-4 flex-wrap gap-1"
  >
    <TypeaheadInput
      props={{ placeholder: m.project_languageCode() }}
      getList={(search) => fuzzySearch.search(search).slice(0, 5)}
      classes="pr-20"
      bind:search={langCode}
      on:itemClicked={(item) => (langCode = item.detail.item.tag)}
    >
      <span class="absolute right-4 italic [line-height:3rem]" slot="custom"
        >{langtagList.find((l) => l.tag === langCode)?.name ?? ''}</span
      >
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
    <select class="select select-bordered" bind:value={productDefinitionFilter}>
      <!-- TODO: i18n -->
      <option value="" selected>Any product definitions</option>
      {#each data.productDefinitions as pD}
        <option value={pD.Name}>{pD.Name}</option>
      {/each}
    </select>
    <select class="select select-bordered" bind:value={organizationFilter}>
      <option value="">All organizations</option>
      {#each new Set(data.projects.map((p) => p.OrganizationName)).values() as org}
        <option value={org}>{org}</option>
      {/each}
    </select>
    <!-- TODO: Filter by update time -->
  </div>
</ProjectSelector>

<style>
  :global(.highlight) {
    background-color: oklch(var(--a));
  }
  :global(li:first-child) .listElement {
    border-radius: 0.375rem 0.375rem 0 0;
  }
  :global(li:last-child) .listElement {
    border-radius: 0 0 0.375rem 0.375rem;
    border-bottom-width: 1px;
  }
  :global(li[aria-selected='true']) .listElement {
    background-color: oklch(var(--b2));
  }
</style>

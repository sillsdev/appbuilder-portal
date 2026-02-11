<script
  lang="ts"
  generics="User extends Prisma.UsersGetPayload<{select: {
      Name: true;
      Email: true;
    }}>, Group extends Prisma.GroupsGetPayload<{ select: { Name: true; _count: { select: { Users: true } }}}>"
>
  import type { Prisma } from '@prisma/client';
  import type { Snippet } from 'svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    header: string | Snippet;
    users: User[];
    user: Snippet<[User]>;
    groups?: Group[];
    group?: Snippet<[Group]>;
  }

  let { header, users: _users, user, groups: _groups = [], group }: Props = $props();

  let searchString = $state('');
  let window = $state(10);
  let page = $state(0);

  const users = $derived.by(() => {
    const locale = getLocale();
    const search = searchString.toLocaleLowerCase(locale);
    return (
      search
        ? _users.filter(
            (u) =>
              u.Name?.toLocaleLowerCase(locale).includes(search) ||
              u.Email?.toLocaleLowerCase(locale).includes(search)
          )
        : _users
    ).toSorted((a, b) => byName(a, b, locale));
  });

  const groups = $derived.by(() => {
    const locale = getLocale();
    const search = searchString.toLocaleLowerCase(locale);
    return (
      search ? _groups.filter((g) => g.Name?.toLocaleLowerCase(locale).includes(search)) : _groups
    ).toSorted((a, b) => byName(a, b, locale));
  });
</script>

<MultiselectBox {header}>
  <SearchBar bind:value={searchString} class="my-4" />
  {#each groups as g}
    <div class="my-2">
      {@render group?.(g)}
    </div>
  {/each}
  {#if groups.length}
    <hr />
  {/if}
  {#key page}
    {#each users.slice(window * page, window * (page + 1)) as u}
      <div class="my-2">
        {@render user(u)}
      </div>
    {/each}
  {/key}
  <Pagination bind:size={window} bind:page total={users.length} />
</MultiselectBox>

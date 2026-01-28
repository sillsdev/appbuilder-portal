<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let groups = $state(data.groups);

  const base = $derived(`/organizations/${data.organization.Id}/settings/groups`);
</script>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  {m.org_addGroupButton()}
</a>

<div class="flex flex-col w-full">
  {#each groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
    <DataDisplayBox
      editable
      onEdit={() => goto(localizeHref(`${base}/edit?id=${group.Id}`))}
      title={group.Name}
      fields={[{ key: 'common_description', value: group.Description }]}
    >
      <IconContainer icon="mdi:account-group" width={20} />
      {group._count.Users}
      <IconContainer icon="fa7-solid:diagram-project" width={20} />
      {group._count.Projects}
    </DataDisplayBox>
  {/each}
</div>

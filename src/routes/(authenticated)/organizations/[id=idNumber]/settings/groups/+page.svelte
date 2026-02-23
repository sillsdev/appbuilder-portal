<script lang="ts">
  import type { PageData } from './$types';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = $derived(`/organizations/${data.organization.Id}/settings/groups`);
</script>

<a href={localizeHref(`${base}/new`)} class="btn btn-outline m-4 mt-0">
  <IconContainer icon={Icons.AddGroup} width={20} />
  {m.org_addGroupButton()}
</a>

<div class="flex flex-col w-full">
  {#each data.groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
    <DataDisplayBox
      editable
      editLink={localizeHref(`${base}/edit?id=${group.Id}`)}
      title={group.Name}
      fields={[{ key: 'common_description', value: group.Description }]}
    >
      <span title={m.sidebar_users()}>
        <IconContainer icon={Icons.Group} width={20} />
        {group._count.Users}
      </span>
      <span title={m.common_projects()}>
        <IconContainer icon={Icons.Project} width={20} />
        {group._count.Projects}
      </span>
    </DataDisplayBox>
  {/each}
</div>

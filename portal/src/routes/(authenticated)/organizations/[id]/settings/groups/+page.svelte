<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { org_addGroupButton } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form: addForm, enhance: addEnhance, allErrors } = superForm(data.addForm);
  const { form: deleteForm, enhance: deleteEnhance } = superForm(data.deleteForm);
</script>

{#each data.groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
  <form action="?/deleteGroup" class="m-2" method="post" use:deleteEnhance>
    <input type="hidden" name="id" value={group.Id} />
    <div class="border w-full flex flex-row p-2 rounded-md items-center place-content-between">
      <div>
        <span class="p-1 badge badge-primary rounded-md">{group.Abbreviation}</span>
        <span class="p-1">{group.Name}</span>
      </div>
      <button type="submit">
        <IconContainer icon="mdi:close" class="" width={26} />
      </button>
    </div>
  </form>
{/each}
<form action="?/addGroup" class="m-2" method="post" use:addEnhance>
  {org_addGroupButton()}
  <input type="hidden" name="id" value={data.organization.Id} />
  <div class="my-4 flex flex-row w-full space-x-2">
    <input class="w-full input input-bordered" type="text" name="name" placeholder="Group name" />
    <input
      class="w-full input input-bordered"
      type="text"
      name="abbreviation"
      placeholder="Group Abbreviation"
    />
    <input type="submit" class="btn btn-primary" value="Submit" />
  </div>
</form>

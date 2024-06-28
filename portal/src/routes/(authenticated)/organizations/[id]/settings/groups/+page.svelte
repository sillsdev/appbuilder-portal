<script lang="ts">
  import { org_addGroupButton } from '$lib/paraglide/messages';
  import Icon from '@iconify/svelte';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;
  const { form: addForm, enhance: addEnhance, allErrors } = superForm(data.addForm);
  const { form: deleteForm, enhance: deleteEnhance } = superForm(data.deleteForm);
</script>

{#each data.organization.Groups as group}
  <form action="?/deleteGroup" class="m-2" method="post" use:deleteEnhance>
    <input type="hidden" name="id" value={group.Id} />
    <div class="border w-full flex flex-row p-2 rounded-md items-center place-content-between">
      <div>
        <span class="p-1 bg-slate-700 rounded-md">{group.Abbreviation}</span>
        <span class="p-1">{group.Name}</span>
      </div>
      <button type="submit">
        <Icon icon="mdi:close" class="" width="26" />
      </button>
    </div>
  </form>
{/each}
<form action="?/addGroup" class="m-2" method="post" use:addEnhance>
  {org_addGroupButton()}
  <input type="hidden" name="id" value={data.organization.Id} />
  <div class="my-4 flex flex-row w-full space-x-2">
    <input class="w-full p-2" type="text" name="name" placeholder="Group name" />
    <input class="w-full p-2" type="text" name="abbreviation" placeholder="Group Abbreviation" />
    <input type="submit" class="btn btn-primary" value="Submit" />
  </div>
</form>

<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';
  import GroupsSelector from '../../../GroupsSelector.svelte';
  import type { ActionData, PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const groupMap = new Map(data.groupsByOrg);
</script>

<div class="flex flex-col px-4">
  {#each data.subjectOrgs.toSorted((a, b) => byName(a, b, getLocale())) as org}
    {@const groups = groupMap.get(org.Id) ?? []}
    <h3>{org.Name}</h3>
    <GroupsSelector {groups}>
      {#snippet selector(group)}
        <form
          action=""
          method="POST"
          use:enhance={({ formElement }) => {
            return async ({ result, update }) => {
              if (result.type === 'success') {
                const res = result.data as ActionData;
                const toggle = formElement.querySelector('[name=enabled]') as HTMLInputElement;
                if (res?.ok) {
                  if (toggle.checked) {
                    toast(
                      'success',
                      m.user_addedTo({ user: data.subject?.Name ?? '', name: group.Name ?? '' })
                    );
                  } else {
                    toast(
                      'success',
                      m.user_removedFrom({ user: data.subject?.Name ?? '', name: group.Name ?? '' })
                    );
                  }
                } else {
                  toast('error', m.errors_generic({ errorMessage: '' }));
                  // reset toggle
                  toggle.checked = !toggle.checked;
                }
              }
              update({ reset: false });
            };
          }}
        >
          <input type="hidden" name="orgId" value={org.Id} />
          <input type="hidden" name="userId" value={data.subject?.Id} />
          <input type="hidden" name="groupId" value={group.Id} />
          <input
            type="checkbox"
            name="enabled"
            class="toggle toggle-accent"
            checked={group.enabled}
            onchange={(e) => {
              (e.currentTarget.parentElement as HTMLFormElement).requestSubmit();
            }}
          />
        </form>
      {/snippet}
    </GroupsSelector>
  {/each}
</div>

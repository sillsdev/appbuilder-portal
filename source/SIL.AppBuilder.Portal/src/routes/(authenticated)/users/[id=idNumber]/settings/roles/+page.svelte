<script lang="ts">
  import { enhance } from '$app/forms';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';
  import RolesSelector from '../../../RolesSelector.svelte';
  import type { ActionData, PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<div class="flex flex-col px-4">
  {#each data.subjectOrgs.toSorted((a, b) => byName(a, b, getLocale())) as org}
    {@const rolesForOrg = data.rolesByOrg.find((o) => o.Id === org.Id)?.UserRoles ?? []}
    <h3>{org.Name}</h3>
    <RolesSelector>
      {#snippet selector(role)}
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
                      m.user_addedTo({
                        user: data.subject?.Name ?? '',
                        name: m.users_roles({ role })
                      })
                    );
                  } else {
                    toast(
                      'success',
                      m.user_removedFrom({
                        user: data.subject?.Name ?? '',
                        name: m.users_roles({ role })
                      })
                    );
                  }
                } else {
                  toast('error', m.errors_generic({ errorMessage: '' }));
                  toggle.checked = !toggle.checked;
                }
              }
              update({ reset: false });
            };
          }}
        >
          <input type="hidden" name="orgId" value={org.Id} />
          <input type="hidden" name="userId" value={data.subject?.Id} />
          <input type="hidden" name="roleId" value={role} />
          <input
            type="checkbox"
            name="enabled"
            class="toggle toggle-accent"
            checked={!!rolesForOrg.find((ro) => ro.RoleId === role)}
            onchange={(e) => {
              (e.currentTarget.parentElement as HTMLFormElement).requestSubmit();
            }}
          />
        </form>
      {/snippet}
    </RolesSelector>
  {/each}
</div>

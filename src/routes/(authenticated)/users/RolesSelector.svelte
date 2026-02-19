<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { RoleId } from '$lib/prisma';
  import { enumNumVals } from '$lib/utils';
  import { byString } from '$lib/utils/sorting';
  interface Props {
    selector?: Snippet<[RoleId]>;
  }

  let { selector }: Props = $props();

  function getRoleIcon(role: RoleId) {
    switch (role) {
      case RoleId.SuperAdmin:
      case RoleId.OrgAdmin:
        return 'eos-icons:admin';
      case RoleId.AppBuilder:
        return 'mdi:worker';
      case RoleId.Author:
        return 'mdi:pencil';
    }
  }
</script>

<div class="flex w-full">
  <div class="shrink space-y-2">
    {#each enumNumVals(RoleId)
      .filter((r) => r !== RoleId.SuperAdmin)
      .toSorted( (a, b) => byString(m.users_roles( { role: a } ), m.users_roles( { role: b } ), getLocale()) ) as role}
      <div class="flex space-x-2">
        {@render selector?.(role)}
        <span>
          <IconContainer icon={getRoleIcon(role)} width={24} />
          {m.users_roles({ role })}
        </span>
      </div>
    {/each}
  </div>
  <div class="grow"></div>
</div>

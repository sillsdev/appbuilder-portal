<script lang="ts" module>
  export type Action = MinifiedActions['actions'][number];
  export type OptionalParams = Omit<MinifiedActions, 'actions'>;
</script>

<script lang="ts">
  import { getProductIcon, getProjectActionIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { ProjectActionString, ProjectActionType } from '$lib/prisma';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import type { MinifiedActions } from '$lib/projects';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props extends Partial<OptionalParams> {
    act: Action;
    compact: boolean;
  }

  let { act, compact, prodDefs, users, groups }: Props = $props();

  const extraBox = $derived(act.T === ProjectActionType.EditField);
</script>

{#snippet actionType(act: Action)}
  {@const icon = getProjectActionIcon(act)}
  {#if icon}
    <IconContainer {icon} width={16} />&nbsp;
  {/if}
  {#if act.T === ProjectActionType.Access}
    {act.A}
  {:else if act.T === ProjectActionType.Author}
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[act.A as ValidI13nKey]?.({ name: m.authors_title() } as any) ?? act.A}
  {:else if act.T === ProjectActionType.Reviewer}
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[act.A as ValidI13nKey]?.({ name: m.reviewers_title() } as any) ?? act.A}
  {:else if act.T === ProjectActionType.EditField}
    {m.models_edit({ name: m[act.A as ValidI13nKey]?.({} as never) ?? act.A })}
  {:else}
    {m[act.A as ValidI13nKey]?.({} as never) ?? act.A}
  {/if}
{/snippet}

{#snippet details(act: Action)}
  {#if act.T === ProjectActionType.Product}
    {@const pd = act.E && prodDefs?.get(act.E)}
    <div class="flex flex-col">
      {#if pd}
        <div>
          <IconContainer icon={getProductIcon(pd.T)} width={24} />
          {pd.N}
        </div>
      {/if}
      <i class="opacity-70">
        {#if act.A !== ProjectActionString.RemoveProduct}
          {m.stores_name()}:
        {:else}
          {m.transitions_state()}:
        {/if}
        <b>
          {act.V}
        </b>
      </i>
    </div>
  {:else if act.T === ProjectActionType.OwnerGroup || act.T === ProjectActionType.Author}
    {#if act.A === ProjectActionString.AssignGroup}
      {(act.E && groups?.get(act.E)) ?? `Group #${act.E}`}
    {:else if act.A !== ProjectActionString.Claim}
      {(act.E && users?.get(act.E)) ?? `User #${act.E}`}
    {/if}
  {:else if act.T === ProjectActionType.Reviewer}
    {act.V}
  {/if}
{/snippet}

{#if !compact}
  <tr class:no-border={extraBox}>
    <td>
      {@render actionType(act)}
    </td>
    <td>
      {users?.get(act.U) ?? `User #${act.U}`}
    </td>
    <td>
      {@render details(act)}
    </td>
    <td>
      {getTimeDateString(act.D)}
    </td>
  </tr>
  {#if extraBox}
    {@const useI18n =
      act.A !== ProjectActionString.EditName &&
      act.A !== ProjectActionString.EditDescription &&
      act.A !== ProjectActionString.EditLanguage}
    <tr>
      <td colspan="4">
        <TaskComment comment={(useI18n && m[act.V as ValidI13nKey]?.({} as never)) || act.V} />
      </td>
    </tr>
  {/if}
{:else}
  <tr class="no-border">
    <td>
      {@render actionType(act)}
    </td>
    <td>
      {getTimeDateString(act.D)}
    </td>
  </tr>
  <tr class:no-border={extraBox}>
    <td>
      {users?.get(act.U) ?? `User #${act.U}`}
    </td>
    <td>
      {@render details(act)}
    </td>
  </tr>
  {#if extraBox}
    {@const useI18n =
      act.A !== ProjectActionString.EditName &&
      act.A !== ProjectActionString.EditDescription &&
      act.A !== ProjectActionString.EditLanguage}
    <tr>
      <td colspan="2">
        <TaskComment comment={(useI18n && m[act.V as ValidI13nKey]?.({} as never)) || act.V} />
      </td>
    </tr>
  {/if}
{/if}

<style>
  td {
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .no-border {
    border: none;
  }
</style>

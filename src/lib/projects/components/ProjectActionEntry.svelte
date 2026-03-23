<script lang="ts" module>
  export type Action = Prisma.ProjectActionsGetPayload<{
    select: {
      User: {
        select: {
          Id: true;
          Name: true;
        };
      };
      DateAction: true;
      ActionType: true;
      Action: true;
      Value: true;
      ExternalId: true;
    };
  }>;

  export type OptionalParams = {
    prodDefs: Prisma.ProductDefinitionsGetPayload<{
      select: { Id: true; Name: true; Workflow: { select: { ProductType: true } } };
    }>[];
    users: Prisma.UsersGetPayload<{ select: { Id: true; Name: true } }>[];
    groups: Prisma.GroupsGetPayload<{ select: { Id: true; Name: true } }>[];
  };
</script>

<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { getProductIcon, getProjectActionIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import { m } from '$lib/paraglide/messages';
  import { ProjectActionString, ProjectActionType } from '$lib/prisma';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props extends Partial<OptionalParams> {
    act: Action;
    compact: boolean;
  }

  let { act, compact, prodDefs, users, groups }: Props = $props();

  const extraBox = $derived(
    act.ActionType === ProjectActionType.EditField || act.ActionType === ProjectActionType.Product
  );
</script>

{#snippet actionType(act: Action)}
  {@const icon = getProjectActionIcon(act)}
  {#if icon}
    <IconContainer {icon} width={16} />&nbsp;
  {/if}
  {#if act.ActionType === ProjectActionType.Access}
    {act.Action}
  {:else if act.ActionType === ProjectActionType.Author}
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[act.Action as ValidI13nKey]({ name: m.authors_title() } as any)}
  {:else if act.ActionType === ProjectActionType.Reviewer}
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[act.Action as ValidI13nKey]({ name: m.reviewers_title() } as any)}
  {:else if act.ActionType === ProjectActionType.EditField}
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m.models_edit({ name: m[act.Action as ValidI13nKey]({} as any) })}
  {:else}
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[act.Action as ValidI13nKey]({} as any)}
  {/if}
{/snippet}

{#snippet details(act: Action)}
  {#if act.ActionType === ProjectActionType.Product}
    {#if act.Action !== ProjectActionString.RemoveProduct}
      {m.stores_name()}:
    {:else}
      {m.transitions_state()}:
    {/if}
    {act.Value}
  {:else if act.ActionType === ProjectActionType.OwnerGroup || act.ActionType === ProjectActionType.Author}
    {#if act.Action === ProjectActionString.AssignGroup}
      {groups?.find((g) => g.Id === act.ExternalId)?.Name}
    {:else if act.Action !== ProjectActionString.Claim}
      {users?.find((u) => u.Id === act.ExternalId)?.Name ?? `User #${act.ExternalId}`}
    {/if}
  {:else if act.ActionType === ProjectActionType.Reviewer}
    {act.Value}
  {/if}
{/snippet}

{#if !compact}
  <tr class:no-border={extraBox}>
    <td>
      {@render actionType(act)}
    </td>
    <td>
      {act.User.Name ?? `User #${act.User.Id}`}
    </td>
    <td>
      {@render details(act)}
    </td>
    <td>
      {getTimeDateString(act.DateAction)}
    </td>
  </tr>
  {#if extraBox}
    <tr>
      <td colspan="4">
        {#if act.ActionType !== ProjectActionType.Product}
          {@const useI18n =
            act.Action !== ProjectActionString.EditName &&
            act.Action !== ProjectActionString.EditDescription &&
            act.Action !== ProjectActionString.EditLanguage}
          <TaskComment comment={useI18n ? m[act.Value as ValidI13nKey]({} as never) : act.Value} />
        {:else}
          {@const pd = prodDefs?.find((p) => p.Id === act.ExternalId)}
          {#if pd}
            <IconContainer icon={getProductIcon(pd.Workflow.ProductType)} width={24} />
            {pd.Name}
          {/if}
        {/if}
      </td>
    </tr>
  {/if}
{:else}
  <tr class="no-border">
    <td>
      {@render actionType(act)}
    </td>
    <td>
      {getTimeDateString(act.DateAction)}
    </td>
  </tr>
  <tr class:no-border={extraBox}>
    <td>
      {act.User.Name ?? `User #${act.User.Id}`}
    </td>
    <td>
      {@render details(act)}
    </td>
  </tr>
  {#if extraBox}
    <tr>
      <td colspan="2">
        {#if act.ActionType !== ProjectActionType.Product}
          {@const useI18n =
            act.Action !== ProjectActionString.EditName &&
            act.Action !== ProjectActionString.EditDescription &&
            act.Action !== ProjectActionString.EditLanguage}
          <TaskComment comment={useI18n ? m[act.Value as ValidI13nKey]({} as never) : act.Value} />
        {:else}
          {@const pd = prodDefs?.find((p) => p.Id === act.ExternalId)}
          {#if pd}
            <IconContainer icon={getProductIcon(pd.Workflow.ProductType)} width={24} />
            {pd.Name}
          {/if}
        {/if}
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

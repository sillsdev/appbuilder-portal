<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { Snippet } from 'svelte';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { getAppIcon, getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import type { UpdateSummaryData } from '$lib/software-updates';
  import { byName, byString } from '$lib/utils/sorting';
  import { getTimeDateString } from '$lib/utils/time';

  interface Props {
    update: UpdateSummaryData;
    presentAppTypes: Prisma.ApplicationTypesGetPayload<{
      select: { Id: true; Description: true };
    }>[];
    productTypes: Map<
      number,
      Prisma.ProductDefinitionsGetPayload<{
        select: { Name: true; Workflow: { select: { ProductType: true } } };
      }>
    >;
    actions?: Snippet;
  }

  let { update, presentAppTypes, productTypes, actions }: Props = $props();

  const projects = $derived(update.Organizations.flatMap((o) => o.Projects));

  const locale = $derived(getLocale());

  type VersionType = {
    ApplicationTypeId: number;
    Versions: string[];
    Description: string;
  };

  const appVersions = $derived(
    new Map<number, VersionType>(
      presentAppTypes.map((at) => [
        at.Id,
        {
          ApplicationTypeId: at.Id,
          Versions: Array.from(
            new Set(
              projects
                .filter((p) => p.TypeId === at.Id)
                .flatMap((p) => p.Products.map((p) => p.Version ?? ''))
                .filter((v) => !!v)
            )
          ),
          Description: at.Description ?? ''
        }
      ])
    )
  );

  const allVersions = $derived(
    Array.from(new Set(Array.from(appVersions.values()).flatMap((v) => v.Versions))).join(', ')
  );

  function getStatus(
    product: Pick<
      UpdateSummaryData['Organizations'][number]['Projects'][number]['Products'][number],
      'DateCompleted' | 'Success'
    >
  ): { color: string; status: 'success' | 'error' | 'pending' } {
    return {
      color: product.DateCompleted
        ? product.Success
          ? 'badge-success'
          : 'badge-error'
        : 'badge-secondary',
      status: product.DateCompleted ? (product.Success ? 'success' : 'error') : 'pending'
    };
  }
</script>

<DataDisplayBox
  class="mx-0!"
  fields={[
    {
      key: 'softwareUpdate_initiatedBy',
      value: update.InitiatedBy.Name
    },
    {
      key: 'common_projects',
      value: projects.length,
      faint: !projects.length
    },
    {
      key: 'products_title',
      value: update._count.UpdatedProducts,
      faint: !update._count.UpdatedProducts
    },
    {
      key: 'softwareUpdate_targetVersions',
      snippet: versions,
      args: {
        list: Array.from(appVersions.values()).sort((a, b) =>
          byString(a.Description, b.Description, locale)
        ),
        classes: 'indent-0'
      },
      faint: !appVersions.size
    }
  ]}
>
  {#snippet title()}
    {@const { Completed: complete = 0, Failed: failed = 0, UpdatedProducts: total } = update._count}
    {@const left = total - (complete + failed)}
    <span class="flex flex-col w-full">
      <span class="flex flex-row">
        <h3 class="grow">
          {#if update.DateCreated}
            [{allVersions}] {getTimeDateString(update.DateCreated)}
          {:else}
            {m.softwareUpdate_summary()}
          {/if}
        </h3>
        {#if actions}
          {@render actions?.()}
        {:else}
          <span class="p-2">
            <b>{m.softwareUpdate_completed()}:</b>
            {getTimeDateString(update.DateCompleted)}
          </span>
        {/if}
      </span>
      <span class="flex flex-row my-2">
        <span
          class="join grow rounded-lg text-sm mr-2 my-1 border border-secondary gap-0.5 bg-secondary"
        >
          {@render progress(
            complete,
            total,
            'bg-success text-success-content',
            !!complete,
            !(failed || left)
          )}
          {@render progress(failed, total, 'bg-error text-error-content', !complete, !left)}
          {@render progress(
            left,
            total,
            'bg-base-300 text-base-content',
            !(complete || failed),
            !!left
          )}
        </span>
        {m.common_total({ total })}
      </span>
    </span>
  {/snippet}
  {#if update.Comment}
    <div class="text-sm opacity-75 pt-1">
      <TaskComment comment={update.Comment} />
    </div>
  {/if}
  <details
    class={[
      'collapse',
      update.Organizations.length ? 'collapse-arrow' : 'opacity-40 pointer-events-none'
    ]}
  >
    <summary class="collapse-title font-bold pl-0 py-1">
      {#if update.Organizations.length}
        {m.org_title()}
        ({update.Organizations.length})
      {/if}
    </summary>
    <div class="collapse-content flex flex-col gap-y-2 px-0">
      {#each update.Organizations.toSorted((a, b) => byName(a, b, locale)) as org}
        <DataDisplayBox
          class="border-base-content/25! m-0!"
          title={org.Name}
          fields={[
            {
              key: 'softwareUpdate_targetVersions',
              snippet: versions,
              args: {
                list: org.Versions.map((v) => ({
                  ...v,
                  Description: appVersions.get(v.ApplicationTypeId)?.Description ?? ''
                })).sort((a, b) => byString(a.Description, b.Description, locale)),
                classes: 'pl-2 indent-0'
              }
            }
          ]}
        >
          <details class="collapse collapse-arrow rounded-none">
            <summary class="collapse-title font-semibold pl-0 py-0">
              {m.common_projects()} ({org.Projects.length})
            </summary>
            <div class="collapse-content flex flex-col gap-y-2 p-0!">
              {#each org.Projects.toSorted((a, b) => byName(a, b, locale)) as project}
                <DataDisplayBox
                  class="border-base-content/25! m-0!"
                  fields={[
                    {
                      key: 'softwareUpdate_targetVersions',
                      value: Array.from(new Set(project.Products.map((p) => p.Version))).join(', ')
                    }
                  ]}
                >
                  {#snippet title()}
                    <a
                      href={localizeHref(`/projects/${project.Id}`)}
                      class="link flex flex-row gap-x-1"
                    >
                      {project.Name}
                      <img src={getAppIcon(project.TypeId)} width={20} alt="" />
                    </a>
                  {/snippet}
                  <details class="collapse collapse-arrow rounded-none">
                    <summary class="collapse-title font-semibold pl-0 py-0">
                      {m.products_title()} ({project.Products.length})
                    </summary>
                    <div class="collapse-content p-0!">
                      <ul>
                        {#each project.Products.toSorted( (a, b) => byName(productTypes.get(a.ProductDefinitionId), productTypes.get(b.ProductDefinitionId), locale) ) as product}
                          {@const pd = productTypes.get(product.ProductDefinitionId)}
                          {@const { color, status } = getStatus(product)}
                          <li>
                            <span class={['badge badge-sm font-bold', color]}>
                              {m.softwareUpdate_status({ status })}
                            </span>
                            <IconContainer
                              icon={getProductIcon(pd?.Workflow.ProductType ?? 0)}
                              width={30}
                            />
                            <a
                              class="hover:underline"
                              href={localizeHref(`/projects/${project.Id}#${product.Id}`)}
                            >
                              {pd?.Name}
                            </a>
                            {#if product.OldVersion}
                              <s>{product.OldVersion}</s>
                            {/if}
                            &rarr; {product.Version}
                            {#if product.DateCompleted}
                              ({getTimeDateString(product.DateCompleted)})
                            {/if}
                          </li>
                        {/each}
                      </ul>
                    </div>
                  </details>
                </DataDisplayBox>
              {/each}
            </div>
          </details>
        </DataDisplayBox>
      {/each}
    </div>
  </details>
</DataDisplayBox>

{#snippet versions(args: { list: VersionType[]; classes?: string })}
  <ul class={args.classes ?? ''}>
    {#each args.list as version}
      <li class="flex flex-row gap-x-1">
        <img src={getAppIcon(version.ApplicationTypeId)} width={20} alt="" />
        {version?.Description}
        ({version.Versions.join(', ')})
      </li>
    {/each}
  </ul>
{/snippet}

{#snippet progress(value: number, total: number, classes: string, first = false, last = false)}
  {#if value && total}
    <span
      class={[
        'min-w-fit px-1 text-xs text-center',
        classes,
        first && 'rounded-l-lg',
        last && 'rounded-r-lg'
      ]}
      style="width: {(100 * value) / total}%;"
    >
      {value}
    </span>
  {/if}
{/snippet}

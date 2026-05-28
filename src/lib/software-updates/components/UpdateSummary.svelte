<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import DataDisplayBox from '$lib/components/settings/DataDisplayBox.svelte';
  import { getAppIcon, getProductIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import TaskComment from '$lib/products/components/TaskComment.svelte';
  import { byName, byString } from '$lib/utils/sorting';

  interface Props {
    update: Prisma.SoftwareUpdatesGetPayload<{
      select: {
        InitiatedBy: { select: { Name: true } };
        Comment: true;
        _count: { select: { UpdatedProducts: true } };
      };
    }>;
    orgs: (Prisma.OrganizationsGetPayload<{
      select: {
        Name: true;
      };
    }> & {
      Projects: (Prisma.ProjectsGetPayload<{
        select: {
          Id: true;
          Name: true;
          TypeId: true;
        };
      }> & {
        Products: (Prisma.ProductsGetPayload<{
          select: { Id: true; ProductDefinitionId: true };
        }> & { OldVersion?: string | null; Version: string })[];
      })[];
    } & {
      Versions: {
        ApplicationTypeId: number;
        Versions: string[];
      }[];
    })[];
    presentAppTypes: Prisma.ApplicationTypesGetPayload<{
      select: { Id: true; Description: true };
    }>[];
    productTypes: Map<
      number,
      Prisma.ProductDefinitionsGetPayload<{
        select: { Name: true; Workflow: { select: { ProductType: true } } };
      }>
    >;
  }

  let { update, orgs, presentAppTypes, productTypes }: Props = $props();

  const projects = $derived(orgs.flatMap((o) => o.Projects));

  const locale = $derived(getLocale());

  type VersionType = {
    ApplicationTypeId: number;
    Versions: string[];
    Description: string;
  };

  const allVersions = $derived(
    new Map<number, VersionType>(
      presentAppTypes.map((at) => [
        at.Id,
        {
          ApplicationTypeId: at.Id,
          Versions: Array.from(
            new Set(
              projects
                .filter((p) => p.TypeId === at.Id)
                .flatMap((p) => p.Products.map((p) => p.Version))
            )
          ),
          Description: at.Description ?? ''
        }
      ])
    )
  );
</script>

<DataDisplayBox
  title={m.softwareUpdate_summary_title()}
  fields={[
    {
      key: 'softwareUpdate_initiated_by',
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
      key: 'softwareUpdate_target_versions_label',
      snippet: versions,
      args: {
        list: Array.from(allVersions.values()).sort((a, b) =>
          byString(a.Description, b.Description, locale)
        ),
        classes: 'indent-0'
      },
      faint: !allVersions.size
    }
  ]}
>
  {#if update.Comment}
    <div class="text-sm opacity-75 pt-1">
      <TaskComment comment={update.Comment} />
    </div>
  {/if}
  <details class={['collapse', orgs.length ? 'collapse-arrow' : 'opacity-40 pointer-events-none']}>
    <summary class="collapse-title font-bold pl-0 py-1">
      {#if orgs.length}
        {m.org_title()}
        ({orgs.length})
      {/if}
    </summary>
    <div class="collapse-content flex flex-col gap-y-2 px-0">
      {#each orgs.toSorted((a, b) => byName(a, b, locale)) as org}
        <DataDisplayBox
          class="border-base-content/25! m-0!"
          title={org.Name}
          fields={[
            {
              key: 'softwareUpdate_target_versions_label',
              snippet: versions,
              args: {
                list: org.Versions.map((v) => ({
                  ...v,
                  Description: allVersions.get(v.ApplicationTypeId)?.Description ?? ''
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
                      key: 'softwareUpdate_target_versions_label',
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
                          <li>
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

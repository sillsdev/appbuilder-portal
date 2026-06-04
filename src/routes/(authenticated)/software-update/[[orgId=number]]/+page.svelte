<script lang="ts">
  import { parse } from 'devalue';
  import type { Readable } from 'svelte/store';
  import { source } from 'sveltekit-sse';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { enhance as svk_enhance } from '$app/forms';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons, getActionIcon, getAppIcon } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import type { ApplicationType } from '$lib/prisma';
  import { ProductActionType } from '$lib/products';
  import type { RebuildsTable } from '$lib/software-updates';
  import UpdateSummary from '$lib/software-updates/components/UpdateSummary.svelte';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';
  import { selectGotoFromOrg, setOrgFromParams } from '$lib/utils/goto-org';
  import { isAdminForOrg } from '$lib/utils/roles';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }
  let { data }: Props = $props();

  const currentPageUrl = page.url.pathname;
  let reconnectDelay = 1000;
  const softwareUpdatesSSE: Readable<RebuildsTable> = $derived.by(() => {
    return source(`${page.url.pathname}/sse`, {
      close({ connect }) {
        setTimeout(() => {
          // If the current page has changed, we don't want to reconnect.
          if (currentPageUrl !== page.url.pathname) {
            return;
          }
          console.log('Disconnected. Reconnecting...');
          connect();
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        }, reconnectDelay);
      }
    })
      .select('rebuilds')
      .transform((t) => (t ? parse(t) : undefined));
  });

  // Use SSE data if available, otherwise fall back to server data
  const updates = $derived({
    complete: data.updates.filter((u) => u.DateCompleted),
    active: data.updates.filter((u) => !u.DateCompleted)
  });

  //const rebuilds = $derived(data.rebuilds);
  const { form, enhance } = superForm(data.form, {
    resetForm: true,
    onUpdate({ form, result, formElement }) {
      if (form.valid && result.type === 'success') {
        toast('success', m.softwareUpdate_toast_success());
        formElement.reset();
      }
    },
    onError({ result }) {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      } else {
        console.log('Unspecified error');
      }
    }
  });

  let applicationTypeIds = $state(
    data.applicationTypes.map(({ Id }) => Id).filter((i) => data.presentAppTypes.has(i))
  );

  afterNavigate(() => {
    // reset application type selection to default after navigating
    applicationTypeIds = data.applicationTypes
      .map(({ Id }) => Id)
      .filter((i) => data.presentAppTypes.has(i));
  });

  const locale = $derived(getLocale());

  const filteredOrgs = $derived(
    data.organizations
      .map((o) => {
        const presentAppTypes = new Set<number>();
        const filtered = {
          ...o,
          Projects: o.Projects.filter((p) => {
            const present = applicationTypeIds.includes(p.TypeId);
            if (present) {
              presentAppTypes.add(p.TypeId);
            }
            return present;
          }),
          Versions:
            o.Versions?.filter((v) => v.Version && presentAppTypes.has(v.ApplicationTypeId)).map(
              (v) => ({
                ApplicationTypeId: v.ApplicationTypeId,
                Versions: [v.Version ?? '']
              })
            ) ?? []
        };

        return filtered;
      })
      .filter((o) => o.Projects.length)
  );

  const filteredProjects = $derived(filteredOrgs.flatMap((o) => o.Projects));

  const products = $derived(filteredProjects.flatMap((p) => p.Products.map((p) => p.Id)));

  // Switch orgs properly
  $effect(() => {
    if (
      !selectGotoFromOrg(
        !!$orgActive && isAdminForOrg($orgActive, data.session.user.roles),
        `/software-update/${$orgActive}`,
        `/software-update`
      )
    ) {
      setOrgFromParams($orgActive, page.params.orgId);
    }
  });
</script>

<div class="w-full px-2 pb-1">
  <h1>{m.softwareUpdate()}</h1>
  <p class="pl-8 mt-2 mb-6">{m.softwareUpdate_description()}</p>
  <div class="w-full m-auto md:max-w-3xl">
    <form class="mx-4 flex flex-col" method="post" action="?/start" use:enhance>
      <input type="hidden" name="products" value={products} />

      <div class="flex flex-col md:flex-row">
        <!-- Application Type Toggles -->
        <div class="grow min-w-xs mb-2">
          <h3 class="font-semibold mb-2 pl-0">{m.softwareUpdate_application_types_title()}</h3>
          <p class="text-sm text-gray-500 mb-4">
            {m.softwareUpdate_application_types_description()}
          </p>

          <div class="flex w-full">
            <div class="shrink space-y-2">
              {#each data.applicationTypes.toSorted( (a, b) => byString(a.Description, b.Description, locale) ) as appType}
                <div
                  class={[
                    'flex space-x-2 items-center',
                    data.presentAppTypes.has(appType.Id) ||
                      'opacity-70 cursor-not-allowed select-none'
                  ]}
                >
                  <input
                    type="checkbox"
                    name="applicationTypeIds"
                    value={appType.Id}
                    bind:group={applicationTypeIds}
                    class="toggle toggle-accent toggle-sm"
                    disabled={!data.presentAppTypes.has(appType.Id)}
                  />
                  <img src={getAppIcon(appType.Id as ApplicationType)} width={24} alt="" />
                  <div class="font-medium">{appType.Description ?? ''}</div>
                </div>
              {/each}
            </div>
            <div class="grow"></div>
          </div>
        </div>
        <LabeledFormInput key="softwareUpdate_comment" class="md:mt-12">
          <textarea
            name="comment"
            class="textarea w-full validator min-h-42"
            bind:value={$form.comment}
            required
          ></textarea>
          <span class="validator-hint">{m.softwareUpdate_comment_required()}</span>
        </LabeledFormInput>
      </div>
      <!-- Summary Information -->
      <UpdateSummary
        update={{
          Id: 0,
          InitiatedBy: data.user,
          DateCreated: null,
          DateCompleted: null,
          Comment: $form.comment,
          _count: {
            UpdatedProducts: products.length
          },
          Organizations: filteredOrgs
        }}
        presentAppTypes={data.applicationTypes.filter((at) => applicationTypeIds.includes(at.Id))}
        productTypes={data.productTypes}
      >
        {#snippet actions()}
          <SubmitButton
            key="softwareUpdate_rebuild_start"
            icon={Icons.UpdateOn}
            disabled={applicationTypeIds.length === 0 || products.length === 0}
          />
        {/snippet}
      </UpdateSummary>
    </form>

    <!-- Rebuilds List -->
    <div class="m-4">
      <div class="space-y-6">
        {#if updates.active.length > 0}
          <h2>{m.softwareUpdate_active_rebuilds_title()}</h2>
          {#each updates.active as update}
            {@const apps = new Set(
              update.Organizations.flatMap((o) => o.Versions.map((v) => v.ApplicationTypeId))
            )}
            <div class="mb-4">
              <UpdateSummary
                {update}
                presentAppTypes={data.applicationTypes.filter((at) => apps.has(at.Id))}
                productTypes={data.productTypes}
              >
                {#snippet actions()}
                  <BlockIfJobsUnavailable>
                    {#snippet altContent()}
                      <IconContainer icon={Icons.Close} width="24" />
                    {/snippet}
                    <form
                      action="?/cancel"
                      method="post"
                      use:svk_enhance={() =>
                        ({ update, result }) => {
                          if (result.type === 'error') {
                            if (result.status === 503) {
                              toast('error', m.system_unavailable());
                            }
                          }
                          update({ reset: false });
                        }}
                    >
                      <input type="hidden" name="id" value={update.Id} />
                      <SubmitButton
                        key="common_cancel"
                        icon={getActionIcon(ProductActionType.CancelWorkflow)}
                      />
                    </form>
                  </BlockIfJobsUnavailable>
                {/snippet}
              </UpdateSummary>
            </div>
          {/each}
        {/if}

        {#if updates.complete.length > 0}
          <h2 class="mt-8">{m.softwareUpdate_completed_rebuilds_title()}</h2>
          {#each updates.complete as update}
            {@const apps = new Set(
              update.Organizations.flatMap((o) => o.Versions.map((v) => v.ApplicationTypeId))
            )}
            <div class="mb-4">
              <UpdateSummary
                {update}
                presentAppTypes={data.applicationTypes.filter((at) => apps.has(at.Id))}
                productTypes={data.productTypes}
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

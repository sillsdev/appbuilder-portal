<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import { type Infer, type SuperValidated, superForm } from 'sveltekit-superforms';
  import type { ReviewerSchema } from './valibot';
  import { enhance as svk_enhance } from '$app/forms';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import LocaleSelector, { getFlag } from '$lib/components/LocaleSelector.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    reviewers: Prisma.ReviewersGetPayload<{
      select: {
        Id: true;
        Name: true;
        Email: true;
      };
    }>[];
    formData: SuperValidated<Infer<ReviewerSchema>>;
    createEndpoint: string;
    deleteEndpoint: string;
    canEdit: boolean;
  }

  let { reviewers, formData, createEndpoint, deleteEndpoint, canEdit }: Props = $props();

  const { form, enhance } = superForm(formData, {
    resetForm: true,
    onUpdate({ form, result, formElement }) {
      if (form.valid && result.type === 'success') {
        formElement.reset();
      }
    }
  });
</script>

<div class="card card-bordered border-slate-400 rounded-md max-w-full">
  <div class="bg-neutral">
    <h2>{m.reviewers_title()}</h2>
  </div>
  <div class="p-2">
    {#if reviewers.length}
      {@const locale = getLocale()}
      {#each reviewers.toSorted((a, b) => byName(a, b, locale)) as reviewer}
        <div class="flex flex-row w-full place-content-between p-2">
          <span>{reviewer.Name} ({reviewer.Email})</span>
          {#if canEdit}
            <form action="?/{deleteEndpoint}" method="post" use:svk_enhance>
              <input type="hidden" name="id" value={reviewer.Id} />
              <button type="submit" class="cursor-pointer">
                <IconContainer icon="mdi:close" width="24" />
              </button>
            </form>
          {/if}
        </div>
      {/each}
    {:else}
      <p class="p-2">{m.reviewers_empty()}</p>
    {/if}
  </div>
  <div class="p-2 bg-neutral">
    {#if canEdit}
      <form
        action="?/{createEndpoint}"
        method="post"
        use:enhance
        onreset={(e) => {
          for (const el of e.currentTarget.querySelectorAll('input')) {
            el.setCustomValidity('');
          }
        }}
      >
        <div class="flex flex-col place-content-between space-y-2">
          <div class="flex flex-col gap-2 reviewerform">
            <input
              type="text"
              name="name"
              placeholder="Name"
              class="input input-bordered grow validator"
              bind:value={$form.name}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              class="input input-bordered grow validator"
              bind:value={$form.email}
              required
            />
          </div>
          <div class="flex flex-row space-x-2">
            <input type="hidden" name="language" value={$form.language} />
            <LocaleSelector
              class={{
                dropdown: 'dropdown-start w-full',
                label: 'select bg-none flex-nowrap grow w-full pl-1 pr-1'
              }}
              currentLocale={() => $form.language}
              onselect={(lang) => ($form.language = lang)}
            >
              {#snippet label()}
                <span class="flex items-center pl-1 w-full">
                  <span class="grow">
                    <IconContainer icon="circle-flags:{getFlag($form.language)}" width="24" />
                    {$form.language?.split('-')[0]}
                  </span>
                  <IconContainer icon="gridicons:dropdown" width="20" />
                </span>
              {/snippet}
            </LocaleSelector>
            <SubmitButton
              disabled={!($form.name && $form.email)}
              icon="mdi:eye-add"
              key="reviewers_submit"
            />
          </div>
        </div>
      </form>
    {/if}
  </div>
</div>

<style>
  @container (width > 450px) {
    .reviewerform {
      flex-direction: row;
    }
  }
</style>

<script lang="ts">
  import { enhance as svk_enhance } from '$app/forms';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, locales } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import type { Prisma } from '@prisma/client';
  import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
  import type { ReviewerSchema } from './valibot';

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
  }

  let { reviewers, formData, createEndpoint, deleteEndpoint }: Props = $props();

  const { form, enhance } = superForm(formData, {
    resetForm: true
  });
</script>

<div class="card card-bordered border-slate-400 overflow-hidden rounded-md max-w-full">
  <div class="bg-neutral">
    <h2>{m.reviewers_title()}</h2>
  </div>
  <div class="p-2">
    {#if reviewers.length}
      {@const locale = getLocale()}
      {#each reviewers.toSorted((a, b) => byName(a, b, locale)) as reviewer}
        <div class="flex flex-row w-full place-content-between p-2">
          <span>{reviewer.Name} ({reviewer.Email})</span>
          <form action="?/{deleteEndpoint}" method="post" use:svk_enhance>
            <input type="hidden" name="id" value={reviewer.Id} />
            <button type="submit" class="cursor-pointer">
              <IconContainer icon="mdi:close" width="24" />
            </button>
          </form>
        </div>
      {/each}
    {:else}
      <p class="p-2">{m.reviewers_empty()}</p>
    {/if}
  </div>
  <div class="p-2 bg-neutral">
    <form action="?/{createEndpoint}" method="post" use:enhance>
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
          <select name="locale" class="grow select select-bordered" bind:value={$form.language}>
            {#each locales as locale}
              <option value={locale}>{locale.split('-')[0]}</option>
            {/each}
          </select>
          <button type="submit" class="btn btn-primary">
            {m.reviewers_submit()}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

<style>
  @container (width > 450px) {
    .reviewerform {
      flex-direction: row;
    }
  }
</style>

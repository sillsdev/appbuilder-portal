<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import LanguageCodeTypeahead from '$lib/components/LanguageCodeTypeahead.svelte';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { langtagRegex, regExpToInputPattern } from '$lib/valibot';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated(event) {
      if (event.form.valid) {
        goto(localizeHref(`/projects/${page.params.id}`));
      }
    },
    onError: ({ result }) => {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    }
  });
</script>

<div class="w-full max-w-6xl mx-auto relative p-2">
  <form action="" method="post" use:enhance>
    <h1>{m.project_editProject()}</h1>
    <div class="flex flex-col gap-2 items-center">
      <div class="row">
        <LabeledFormInput
          key="project_name"
          class="md:max-w-xs grow"
          input={{
            name: 'name',
            err: m.formErrors_nameEmpty(),
            icon: Icons.Name,
            required: true
          }}
          bind:value={$form.name}
        />
        <LabeledFormInput key="project_owner" class="md:max-w-xs">
          <BlockIfJobsUnavailable class="select">
            {#snippet altContent()}
              <IconContainer icon={Icons.User} width={20} />
              {data.owners.find((o) => o.Id === $form.owner)?.Name}
            {/snippet}
            <SelectWithIcon
              attr={{ name: 'owner' }}
              bind:value={$form.owner}
              items={data.owners}
              icon={Icons.User}
              class="w-full"
            />
          </BlockIfJobsUnavailable>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput key="project_group" class="md:max-w-xs grow">
          <SelectWithIcon
            attr={{ name: 'group' }}
            bind:value={$form.group}
            items={data.groups}
            icon={Icons.Group}
            class="w-full"
          />
        </LabeledFormInput>
        <LabeledFormInput key="project_languageCode" class="md:max-w-xs">
          <LanguageCodeTypeahead
            bind:langCode={$form.language}
            class={{
              dropdown: 'left-0',
              input: 'w-full md:max-w-xs validator'
            }}
            inputElProps={{ required: true, pattern: regExpToInputPattern(langtagRegex) }}
          >
            {#snippet validatorHint()}
              <span class="validator-hint">Invalid BCP 47 Language Tag</span>
            {/snippet}
          </LanguageCodeTypeahead>
        </LabeledFormInput>
      </div>
      <div class="row">
        <LabeledFormInput key="common_description" class="w-full max-w-2xl">
          <textarea
            name="description"
            class="textarea h-48 w-full"
            bind:value={$form.description}
          ></textarea>
        </LabeledFormInput>
      </div>
      <div class="flex flex-row flex-wrap place-content-center gap-4 p-4 w-full">
        <CancelButton
          returnTo={localizeHref(`/projects/${page.params.id}`)}
          class="w-full max-w-xs"
        />
        <SubmitButton
          class="w-full max-w-xs"
          disabled={!($form.name.length && $form.language.length)}
        />
      </div>
    </div>
  </form>
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: calc(var(--spacing) * 2);
    column-gap: calc(var(--spacing) * 8);
    width: 100%;
    justify-content: center;
  }
</style>

<script lang="ts">
  import {
    type IOrthography,
    createTagFromOrthography,
    defaultDisplayName
  } from '@ethnolib/find-language';
  import { LanguageChooserModal } from '@ethnolib/language-chooser-svelte-daisyui';

  let showModal: () => void = $state(() => {});
  let orthography: IOrthography = $state({});
  let languageTag: string | undefined = $state();
</script>

<LanguageChooserModal bind:show={showModal} bind:orthography bind:languageTag />

<div class="min-h-screen bg-base-200 p-6">
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <div class="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
      <h1 class="text-3xl font-semibold">Language Chooser Demo</h1>
    </div>

    <div class="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
      <h2 class="text-lg font-semibold">Selected Language</h2>
      <div class="mt-4 space-y-3 text-sm">
        <div>
          <div class="text-base-content/60">Display name</div>
          <div class="font-medium">
            {orthography.language
              ? orthography.customDetails?.customDisplayName ||
                defaultDisplayName(orthography.language, orthography.script)
              : 'No language selected yet'}
          </div>
        </div>
        <div>
          <div class="text-base-content/60">Language code</div>
          <div class="font-mono">{orthography.language?.languageSubtag || '-'}</div>
        </div>
        <div>
          <div class="text-base-content/60">Script</div>
          <div>{orthography.script?.name || '-'}</div>
        </div>
        <div>
          <div class="text-base-content/60">Region</div>
          <div>{orthography.customDetails?.region?.name || '-'}</div>
        </div>
        <div>
          <div class="text-base-content/60">Dialect</div>
          <div>{orthography.customDetails?.dialect || '-'}</div>
        </div>
        <div>
          <div class="text-base-content/60">Language tag</div>
          <div class="font-mono break-all">
            {languageTag ?? (orthography.language ? createTagFromOrthography(orthography) : '-')}
          </div>
        </div>
      </div>

      <button class="btn btn-primary mt-6" onclick={showModal}>Choose Language</button>
    </div>
  </div>
</div>

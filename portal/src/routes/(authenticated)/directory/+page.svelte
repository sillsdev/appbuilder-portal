<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import ProjectSelector from '../projects/components/ProjectSelector.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<ProjectSelector projects={data.projects}>
  <h1 slot="header" class="p-4 pl-6">{m.sidebar_projectDirectory()}</h1>
  <div
    slot="options"
    class="w-full flex flex-row place-content-between p-4 pb-0 px-6 space-between-4"
  >
    <input
      type="text"
      name="langCode"
      class="input input-bordered"
      placeholder={m.project_languageCode()}
    />
  </div>
</ProjectSelector>

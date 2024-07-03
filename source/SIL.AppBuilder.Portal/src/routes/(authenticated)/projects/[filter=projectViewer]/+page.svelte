<script lang="ts">
  import ProjectSelector from '../components/ProjectSelector.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<ProjectSelector projects={data.projects} />

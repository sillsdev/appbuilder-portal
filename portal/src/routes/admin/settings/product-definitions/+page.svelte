<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import InternationalizedDataBox from '$lib/components/InternationalizedDataBox.svelte';

	export let data: PageData;
</script>
<div class="flex grow flex-col">
	<h2>{$_('admin.settings.productDefinitions.title')}</h2>

	<div class="btn btn-outline rounded-none m-4 mt-0">
		{$_('admin.settings.productDefinitions.add')}
	</div>

	<div class="flex flex-col w-full">
		{#each data.productDefinitions.sort((a, b) => a.Name?.localeCompare(b.Name ?? "") ?? 0) as pD}
			<InternationalizedDataBox title="{pD.Name}" fields="{[
				{ key: 'admin.settings.productDefinitions.type', value: pD.ApplicationTypes.Name },
				{ key: 'admin.settings.productDefinitions.workflow', value: pD.Workflow.Name },
				{ key: 'admin.settings.productDefinitions.rebuildWorkflow', value: pD.RebuildWorkflow?.Name },
				{ key: 'admin.settings.productDefinitions.republishWorkflow', value: pD.RepublishWorkflow?.Name },
				{ key: 'admin.settings.productDefinitions.description', value: pD.Description }
			]}"/>
		{/each}
	</div>
</div>

<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';

	export let data: PageData;
</script>
<div class="flex grow flex-col">
	<h2>{$_('admin.settings.productDefinitions.title')}</h2>

	<div class="btn btn-outline rounded-none m-4 mt-0">
		{$_('admin.settings.productDefinitions.add')}
	</div>

	<div class="flex flex-col w-full">
		{#each data.productDefinitions.sort((a, b) => a.Name?.localeCompare(b.Name ?? "") ?? 0) as pD}
			<div class="flex flex-row border-2 p-2 mx-4 m-2">
				<div>
					<h3>{pD.Name}</h3>
					<p><b>{$_('admin.settings.productDefinitions.type')}: </b> {pD.ApplicationTypes.Name}</p>
					<p><b>{$_('admin.settings.productDefinitions.workflow')}: </b> {pD.Workflow.Name}</p>
					<p><b>{$_('admin.settings.productDefinitions.rebuildWorkflow')}: </b> {pD.RebuildWorkflow?.Name ?? ""}</p>
					<p><b>{$_('admin.settings.productDefinitions.republishWorkflow')}: </b> {pD.RepublishWorkflow?.Name ?? ""}</p>
					<p><b>{$_('admin.settings.productDefinitions.description')}: </b> {pD.Description}</p>
				</div>
			</div>
		{/each}
	</div>
</div>

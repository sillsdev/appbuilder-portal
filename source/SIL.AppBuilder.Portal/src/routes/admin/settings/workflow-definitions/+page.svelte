<script lang="ts">
	import type { PageData } from './$types';
	import { _ } from 'svelte-i18n';

	export let data: PageData;
</script>

<div class="flex flex-col">
	<h2>{$_('admin.settings.workflowDefinitions.title')}</h2>

	<div class="btn btn-outline rounded-none m-4 mt-0">
		{$_('admin.settings.workflowDefinitions.add')}
	</div>

	<div class="flex flex-col w-full">
		{#each data.workflowDefinitions as wd}
			<div class="flex flex-row border-2 p-2 w-full ml-4 m-2">
				<div>
					<h3>{wd.Name}</h3>
					<p><b>{$_('admin.settings.workflowDefinitions.description')}: </b> {wd.Description}</p>
					<p>
						<b>{$_('admin.settings.workflowDefinitions.storeType')}: </b>
						{wd.StoreType?.Name}
					</p>
					<p>
						<b>{$_('admin.settings.workflowDefinitions.workflowType')}: </b>
						{$_('admin.settings.workflowDefinitions.workflowTypes.' + wd.Type)}
					</p>
					<p>
						<b>{$_('admin.settings.workflowDefinitions.workflowScheme')}: </b>
						{wd.WorkflowScheme}
					</p>
					<p>
						<b>{$_('admin.settings.workflowDefinitions.workflowBusinessFlow')}: </b>
						{wd.WorkflowBusinessFlow}
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>

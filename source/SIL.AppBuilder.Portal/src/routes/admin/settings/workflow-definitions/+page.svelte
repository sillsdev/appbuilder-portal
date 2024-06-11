<script lang="ts">
	import InternationalizedDataBox from '$lib/components/InternationalizedDataBox.svelte';
	import type { PageData } from './$types';
	import { _ } from 'svelte-i18n';

	export let data: PageData;
</script>

<div class="flex grow flex-col">
	<h2>{$_('admin.settings.workflowDefinitions.title')}</h2>

	<div class="btn btn-outline rounded-none m-4 mt-0">
		{$_('admin.settings.workflowDefinitions.add')}
	</div>

	<div class="flex flex-col w-full">
		{#each data.workflowDefinitions.sort((a, b) => a.Name?.localeCompare(b.Name ?? '') ?? 0) as wd}
			<InternationalizedDataBox
				title={wd.Name}
				fields={[
					{ key: 'admin.settings.workflowDefinitions.description', value: wd.Description },
					{ key: 'admin.settings.workflowDefinitions.storeType', value: wd.StoreType?.Name },
					{
						key: 'admin.settings.workflowDefinitions.workflowType',
						value: $_('admin.settings.workflowDefinitions.workflowTypes.' + wd.Type)
					},
					{ key: 'admin.settings.workflowDefinitions.workflowScheme', value: wd.WorkflowScheme },
					{
						key: 'admin.settings.workflowDefinitions.workflowBusinessFlow',
						value: wd.WorkflowBusinessFlow
					}
				]}
			/>
		{/each}
	</div>
</div>

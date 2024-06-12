<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';
	import InternationalizedDataBox from '$lib/components/InternationalizedDataBox.svelte';

	export let data: PageData;

	const workflows = data.options.workflows.filter((w) => w.Type === 1);
	const rebuildWorkflows = data.options.workflows.filter((w) => w.Type === 2);
	const republishWorkflows = data.options.workflows.filter((w) => w.Type === 3);
	let editing: PageData['productDefinitions'][0];
</script>

<div class="flex grow flex-col">
	<h2>{$_('admin.settings.productDefinitions.title')}</h2>

	{#if editing}
		<form class="m-4" method="post" action="?/edit">
			<input type="hidden" name="id" value={editing.Id} />
			<div>
				<label>
					{$_('admin.settings.productDefinitions.name')}
					<input class="block w-full p-4" type="text" name="name" value={editing.Name} />
				</label>
			</div>
			<div>
				<label>
					{$_('admin.settings.productDefinitions.type')}
					<select name="applicationType">
						{#each data.options.applicationTypes as type}
							<option value={type.Id} selected={type.Id === editing.TypeId}>{type.Name}</option>
						{/each}
					</select>
				</label>
			</div>
			<div>
				<label>
					{$_('admin.settings.productDefinitions.workflow')}
					<select name="workflow">
						{#each workflows.filter((w) => w.Type) as workflow}
							<option value={workflow.Id} selected={workflow.Id === editing.WorkflowId}
								>{workflow.Name}</option
							>
						{/each}
					</select>
				</label>
			</div>
			<div>
				<label>
					{$_('admin.settings.productDefinitions.rebuildWorkflow')}
					<select name="rebuildWorkflow">
						{#each rebuildWorkflows.filter((w) => w.Type) as workflow}
							<option value={workflow.Id} selected={workflow.Id === editing.RebuildWorkflowId}
								>{workflow.Name}</option
							>
						{/each}
					</select>
				</label>
			</div>
			<div>
				<label>
					{$_('admin.settings.productDefinitions.republishWorkflow')}
					<select name="republishWorkflow">
						{#each republishWorkflows.filter((w) => w.Type) as workflow}
							<option value={workflow.Id} selected={workflow.Id === editing.RepublishWorkflowId}
								>{workflow.Name}</option
							>
						{/each}
					</select>
				</label>
			</div>
			<div>
				<label>
					{$_('admin.settings.productDefinitions.description')}
					<textarea name="description">{editing.Description}</textarea>
				</label>
			</div>
			<div>
				<label>
					{$_('admin.settings.productDefinitions.properties')}
					<textarea name="description">{editing.Properties}</textarea>
				</label>
			</div>
		</form>
	{:else}
		<div class="btn btn-outline rounded-none m-4 mt-0">
			{$_('admin.settings.productDefinitions.add')}
		</div>

		<div class="flex flex-col w-full">
			{#each data.productDefinitions.sort((a, b) => a.Name?.localeCompare(b.Name ?? '') ?? 0) as pD}
				<InternationalizedDataBox
					editable
					on:edit={() => (editing = pD)}
					title={pD.Name}
					fields={[
						{ key: 'admin.settings.productDefinitions.type', value: pD.ApplicationTypes.Name },
						{ key: 'admin.settings.productDefinitions.workflow', value: pD.Workflow.Name },
						{
							key: 'admin.settings.productDefinitions.rebuildWorkflow',
							value: pD.RebuildWorkflow?.Name
						},
						{
							key: 'admin.settings.productDefinitions.republishWorkflow',
							value: pD.RepublishWorkflow?.Name
						},
						{ key: 'admin.settings.productDefinitions.description', value: pD.Description }
					]}
				/>
			{/each}
		</div>
	{/if}
</div>

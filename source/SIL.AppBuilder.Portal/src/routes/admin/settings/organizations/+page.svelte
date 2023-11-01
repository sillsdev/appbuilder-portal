<script lang="ts">
	import type { PageData } from './$types';
	import { _ } from 'svelte-i18n';

	export let data: PageData;
</script>

<div class="flex flex-col">
	<h2>{$_('admin.settings.organizations.title')}</h2>

	<div class="btn btn-outline rounded-none m-4 mt-0">{$_('admin.settings.organizations.add')}</div>

	<div class="flex flex-col w-full">
		{#each data.organizations as organization}
			<div class="flex flex-row border-2 p-2 w-full ml-4 m-2">
				<div>
					<h3>{organization.Name}</h3>
					<p><b>{$_('admin.settings.organizations.owner')}: </b> {organization.Owner.Name}</p>
					<p>
						<b>{$_('admin.settings.organizations.buildEngineURL')}: </b>
						{organization.WebsiteUrl}
					</p>
					<p>
						<b>{$_('admin.settings.organizations.accessToken')}: </b>
						{organization.BuildEngineApiAccessToken}
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>

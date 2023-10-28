<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { base } from '$app/paths';
	import { page } from '$app/stores';

	let adminLinks = [
		{ text: 'admin.settings.navigation.organizations', route: 'organizations' },
		{ text: 'admin.settings.navigation.workflowdefinitions', route: 'workflow-definitions' },
		{ text: 'admin.settings.navigation.productDefinitions', route: 'product-definitions' },
		{ text: 'admin.settings.navigation.storeTypes', route: 'store-types' },
		{ text: 'admin.settings.navigation.stores', route: 'stores' },
		{ text: 'admin.settings.navigation.buildEngines', route: 'build-engines' }
	];

	function isActive(currentRoute: string | null, menuRoute: string) {
		return currentRoute?.endsWith(menuRoute);
	}
</script>

<div>
	<h1>{$_('admin.settings.title')}</h1>
	<div class="flex flex-row">
		<ul class="menu p-4">
			{#each adminLinks as adminLink}
				<li class="border-2 w-60">
					<a
						class="rounded-none bg-base-200 p-3"
						class:active={isActive($page.route.id, adminLink.route)}
						href="{base}/admin/settings/{adminLink.route}">{$_(adminLink.text)}</a
					>
				</li>
			{/each}
		</ul>
		<div>
			<slot />
		</div>
	</div>
</div>

<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { base } from '$app/paths';
	import { page } from '$app/stores';

	let adminLinks = [
		{ text: 'admin.settings.navigation.organizations', route: 'organizations' },
		{ text: 'admin.settings.navigation.workflowdefinitions', route: 'workflow-definitions' },
		{ text: 'admin.settings.navigation.productDefinitions', route: 'product-definitions' },
		{ text: 'admin.settings.navigation.stores', route: 'stores' },
		{ text: 'admin.settings.navigation.storeTypes', route: 'store-types' },
		{ text: 'admin.settings.navigation.buildEngines', route: 'build-engines' }
	];

	function isActive(currentRoute: string | null, menuRoute: string) {
		return currentRoute?.endsWith(menuRoute);
	}
</script>

<div class="w-full max-w-6xl mx-auto">
	<div class="flex flex-row">
		<div class="p-4 sticky top-0 self-start">
			<!-- No idea why tailwind text-nowrap won't work, but this does -->
			<h1 class="p-4 [text-wrap:nowrap]">{$_('admin.settings.title')}</h1>
			<ul class="menu p-0 rounded border border-slate-600">
				{#each adminLinks as adminLink}
					<li class="w-60 border-t border-slate-600 w-full">
						<a
							class="rounded-none bg-base-200 p-3"
							class:active={isActive($page.route.id, adminLink.route)}
							href="{base}/admin/settings/{adminLink.route}">{$_(adminLink.text)}</a
						>
					</li>
				{/each}
			</ul>

		</div>
		<div class="flex grow mt-16">
			<slot />
		</div>
	</div>
</div>

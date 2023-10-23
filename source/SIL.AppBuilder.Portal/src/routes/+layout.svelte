<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import '../app.css';
	import { HamburgerIcon } from '$lib/icons';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	$: organization = 1;

	function isActive(currentRoute: string | null, menuRoute: string) {
		console.log(`currentRoute:${currentRoute}, menuRoute:${menuRoute}`);
		return currentRoute?.startsWith(menuRoute);
	}
</script>

<div class="navbar bg-[#1C3258]">
	<div class="navbar-start">
		<label
			for="primary-content-drawer"
			class="btn btn-ghost btn-circle p-1 drawer-button lg:hidden"
		>
			<HamburgerIcon color="white" />
		</label>
		<p class="uppercase text-white lg:ps-4">{$_('appName')}</p>
		<!-- <p>SCRIPTORIA</p> -->
	</div>
	<div class="navbar-end">
		<LanguageSelector />
	</div>
</div>

<div class="drawer lg:drawer-open">
	<input id="primary-content-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-row items-start justify-start">
		<slot />
	</div>

	<div class="drawer-side">
		<label for="primary-content-drawer" class="drawer-overlay" />
		<ul
			class="menu menu-lg mt-16 lg:mt-0 rounded-r-xl p-0 w-full min-[480px]:w-1/2 min-[720px]:w-1/3 lg:border-r-2 lg:w-72 bg-base-100 text-base-content h-full"
		>
			<li>
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/tasks')}
					href="{base}/tasks"
				>
					{$_('sidebar.myTasks', { values: { count: 1 } })}
				</a>
			</li>
			<li>
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/projects/own')}
					href="{base}/projects/own"
				>
					{$_('sidebar.myProjects')}
				</a>
			</li>
			<li>
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/projects/organization')}
					href="{base}/projects/organization"
				>
					{$_('sidebar.organizationProjects')}
				</a>
			</li>
			<li>
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/projects/active')}
					href="{base}/projects/active"
				>
					{$_('sidebar.activeProjects')}
				</a>
			</li>
			<li>
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/users')}
					href="{base}/users"
				>
					{$_('sidebar.users')}
				</a>
			</li>
			<li>
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/organizations/[id]/settings')}
					href="{base}/organizations/{organization}/settings"
				>
					{$_('sidebar.organizationSettings')}
				</a>
			</li>
			<li>
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/admin/settings/organizations')}
					href="{base}/admin/settings/organizations"
				>
					{$_('sidebar.adminSettings')}
				</a>
			</li>
			<li class="menu-item-divider-top menu-item-divider-bottom">
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/directory')}
					href="{base}/directory"
				>
					{$_('sidebar.projectDirectory')}
				</a>
			</li>
			<li>
				<a
					class="rounded-none"
					class:active-menu-item={isActive($page.route.id, '/open-source')}
					href="{base}/open-source"
				>
					{$_('opensource')}
				</a>
			</li>
		</ul>
	</div>
</div>

<style>
	.navbar {
		padding: 0px;
		height: 3rem;
		min-height: 3rem;
	}
	.menu-item-divider-bottom {
		border-bottom: 2px solid #e5e5e5;
	}
	.menu-item-divider-top {
		border-top: 2px solid #e5e5e5;
	}

	.active-menu-item {
		border-left: 5px solid #1c3258; /* Adjust the border color and width to your preferences */
		font-weight: bold;
	}
</style>

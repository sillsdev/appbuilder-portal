<script>
	import { _ } from 'svelte-i18n';
	import { base } from '$app/paths';
	import '../app.css';
	import { HamburgerIcon } from '$lib/icons';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	$: organization = 1;
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
			class="menu mt-16 lg:mt-0 rounded-r-xl p-4 w-1/3 lg:w-64 bg-base-100 text-base-content h-full"
		>
			<li>
				<a href="{base}/tasks">
					{$_('sidebar.myTasks')}
				</a>
			</li>
			<li>
				<a href="{base}/projects/own">
					{$_('sidebar.myProjects')}
				</a>
			</li>
			<li>
				<a href="{base}/projects/organization">
					{$_('sidebar.organizationProjects')}
				</a>
			</li>
			<li>
				<a href="{base}/projects/active">
					{$_('sidebar.activeProjects')}
				</a>
			</li>
			<li>
				<a href="{base}/users">
					{$_('sidebar.users')}
				</a>
			</li>
			<li>
				<a href="{base}/orgainizations/{organization}/settings">
					{$_('sidebar.organizationSettings')}
				</a>
			</li>
			<li>
				<a href="{base}/admin/settings/orgainizations">
					{$_('sidebar.adminSettings')}
				</a>
			</li>
			<li>
				<a href="{base}/directory">
					{$_('sidebar.projectDirectory')}
				</a>
			</li>
			<li>
				<a href="{base}/open-source">
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
</style>

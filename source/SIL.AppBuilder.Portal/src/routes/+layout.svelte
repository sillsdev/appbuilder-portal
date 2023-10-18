<script>
	import { _ } from 'svelte-i18n';
	import '../app.css';
	import { HamburgerIcon } from '$lib/icons';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
</script>

<div class="navbar bg-[#1C3258]">
	<div class="navbar-start">
		<label for="sidebar" class="btn btn-ghost btn-circle p-1 drawer-button lg:hidden">
			<HamburgerIcon color="white" />
		</label>
		<p class="uppercase text-white lg:ps-4">{$_('appName')}</p>
		<!-- <p>SCRIPTORIA</p> -->
	</div>
	<div class="navbar-end">
		<LanguageSelector />
	</div>
</div>
<slot />

<style>
	.navbar {
		padding: 0px;
		height: 3rem;
		min-height: 3rem;
	}
</style>

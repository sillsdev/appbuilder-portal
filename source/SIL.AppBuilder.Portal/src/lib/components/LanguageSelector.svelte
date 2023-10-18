<script lang="ts">
	import Icon from '@iconify/svelte';
	import { LanguageIcon } from '$lib/icons';
	import { _, locale, locales } from 'svelte-i18n';

	function setLocale(lang: string | null | undefined) {
		locale.set(lang);
		const elem = document.activeElement as HTMLElement;
		if (elem) {
			elem?.blur();
		}
		return;
	}

	function isActive(lang: string, current: any) {
		if (lang === current?.substring(0, 2)) {
			return 'active';
		} else {
			return 'inactive';
		}
	}
</script>

{#key $_('lang')}
	<div class="dropdown dropdown-end">
		<label
			for
			class="btn btn-ghost m-2 p-2 rounded-xl items-middle justify-center flex-nowrap"
			tabindex="-1"
		>
			<LanguageIcon color="white" />
		</label>
		<div class="dropdown-content bg-base-200 w-48 rounded-md overflow-y-auto">
			<ul class="menu menu-compact gap-1 p-2" tabindex="-1">
				{#each $locales as lang}
					<li>
						<div
							class="btn flex {isActive(lang, $locale)}"
							on:click={setLocale(lang)}
							on:keypress={setLocale(lang)}
						>
							<Icon icon="circle-flags:{lang}" color="white" width="24" />
							{lang}
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/key}

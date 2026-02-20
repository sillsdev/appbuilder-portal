<script lang="ts">
  import sv_flatpickr, { themeChanger, themeNames } from 'svelte-flatpickr-plus';
  import { browser } from '$app/environment';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  // This component is here because the range mode of the Flatpickr svelte package
  // is a bit broken. Essentially, the 'value' property is updated when the second
  // date is clicked but not reassigned, only when the first is and it is set to a new value.

  // Note: At the moment, the site always follows prefered color scheme
  // If at some point in the future a manual toggle is added, this will need to be changed
  let isDarkMode: boolean = $state(
    browser ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );
  if (browser) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      isDarkMode = event.matches;
    });
  }
  $effect(() => {
    themeChanger(isDarkMode ? themeNames.dark : themeNames.light);
  });

  interface Props {
    chosenDates?: [Date, Date | null] | null;
    placeholder?: string;
  }

  let { chosenDates = $bindable(null), placeholder = '' }: Props = $props();

  let dateElement: HTMLElement;
</script>

<div
  class="dateRangePicker"
  bind:this={dateElement}
  use:sv_flatpickr={{
    mode: 'range',
    altInput: true,
    altFormat: 'M j, Y',
    wrap: true,
    onChange: (v) =>
      (chosenDates = [
        v[0],
        // Add one day to include the final day
        v[1] ? new Date(v[1].getTime() + 1000 * 60 * 60 * 24) : null
      ])
  }}
>
  <label class="input flex items-center gap-2 w-full">
    <IconContainer icon={Icons.DateRange} width={24} class="cursor-pointer" />
    <input name="dateRange" class="grow" {placeholder} data-input />
    {#if chosenDates?.some((d) => !!d)}
      <button
        onclick={(e) => {
          //@ts-expect-error This is somehow how this is supposed to work according to the docs
          dateElement._flatpickr.clear();
          chosenDates = null;
          e.preventDefault();
        }}
        title={m.common_clear()}
      >
        <IconContainer icon={Icons.Close} class="ml-auto cursor-pointer" width={24} />
      </button>
    {/if}
  </label>
</div>

<style>
  .dateRangePicker {
    flex: 1;
  }
  :global(.dateRangePicker .flatpickr-wrapper) {
    width: 100%;
  }
  :global(.dateRangePicker .flatpickr-calendar) {
    right: 0;
  }
</style>

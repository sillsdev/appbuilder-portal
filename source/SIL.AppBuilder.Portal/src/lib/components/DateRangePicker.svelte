<script lang="ts">
  import { browser } from '$app/environment';
  import sv_flatpickr, { themeChanger, themeNames } from 'svelte-flatpickr-plus';
  // This component is here because the range mode of the Flatpickr svelte package
  // is a bit broken. Essentially, the 'value' property is updated when the second
  // date is clicked but not reassigned, only when the first is and it is set to a new value.

  // TODO: add an obvious clear button to the date picker. Right now the best way to clear
  // the filter is reloading the page, or choosing a first date and not a second one

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
</script>

<div class="dateRangePicker">
  <input
    name="dateRange"
    use:sv_flatpickr={{
      mode: 'range',
      altInput: true,
      altFormat: 'M j, Y',
      static: true,
      onChange: (v) =>
        (chosenDates = [
          v[0],
          // Add one day to include the final day
          v[1] ? new Date(v[1].getTime() + 1000 * 60 * 60 * 24) : null
        ])
    }}
    class="input input-bordered w-full min-w-40"
    {placeholder}
  />
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

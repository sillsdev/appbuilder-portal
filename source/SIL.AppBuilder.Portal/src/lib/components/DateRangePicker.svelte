<script lang="ts">
  import { browser } from '$app/environment';
  import Flatpickr from 'svelte-flatpickr';
  // This component is here because the range mode of the Flatpickr svelte package
  // is a bit broken. Essentially, the 'value' property is updated when the second
  // date is clicked but not reassigned, only when the first is and it is set to a new value.

  // TODO: add an obvious clear button to the date picker. Right now the best way to clear
  // the filter is reloading the page, or choosing a first date and not a second one

  // Note: At the moment, the site always follows prefered color scheme
  // If at some point in the future a manual toggle is added, this will need to be changed
  let isDarkMode: boolean = browser
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
  browser &&
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      isDarkMode = event.matches;
    });

  export let chosenDates: [Date, Date | null] | null = null;
  export let placeholder: string = '';
</script>

<svelte:head>
  <!-- NOTE: this is an external cdn... probably ok -->
  {#if isDarkMode}
    <link
      rel="stylesheet"
      type="text/css"
      href="https://npmcdn.com/flatpickr/dist/themes/dark.css"
    />
  {/if}
</svelte:head>
<div class="dateRangePicker">
  <Flatpickr
    options={{
      mode: 'range',
      altInput: true,
      altFormat: 'M j, Y',
      static: true
    }}
    class="input input-bordered w-full min-w-40"
    {placeholder}
    on:change={(v) =>
      (chosenDates = [
        v.detail[0][0],
        // Add one day to include the final day
        v.detail[0][1] ? new Date(v.detail[0][1].getTime() + 1000 * 60 * 60 * 24) : null
      ])}
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

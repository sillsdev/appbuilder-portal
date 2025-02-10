<script lang="ts">
  import Pikaday from '@handsontable/pikaday';
  // This component is here because the range mode of the Flatpickr svelte package
  // is a bit broken. Essentially, the 'value' property is updated when the second
  // date is clicked but not reassigned, only when the first is and it is set to a new value.

  // TODO: add an obvious clear button to the date picker. Right now the best way to clear
  // the filter is reloading the page, or choosing a first date and not a second one

  // based on: https://codepen.io/melenie/pen/gObPeGx

  interface Props {
    chosenDates?: [Date, Date | null] | null;
    placeholder?: string;
  }

  let { chosenDates = $bindable(null), placeholder = '' }: Props = $props();

  let startInput: HTMLInputElement | undefined = undefined;
  let endInput: HTMLInputElement | undefined = undefined;
  // svelte-ignore non_reactive_update
  let startPicker: Pikaday | undefined = undefined;
  let endPicker: Pikaday | undefined = undefined;
  let pickContainer: HTMLDivElement | undefined = undefined;
  let targeting: boolean = false;
  let open: boolean = $state(false);
  function buildDatePicker(startInput: HTMLInputElement, endInput: HTMLInputElement) {
    startPicker = new Pikaday({
      bound: false,
      field: startInput,
      container: pickContainer,
      maxDate: new Date(),
      onSelect: () => {
        updateStartDate(startPicker?.getDate() ?? null);
      }
    });
    startPicker.hide();
    endPicker = new Pikaday({
      bound: false,
      field: endInput,
      container: pickContainer,
      maxDate: new Date(),
      onSelect: () => {
        updateEndDate(endPicker?.getDate() ?? null);
      }
    });
    endPicker.hide();
    return () => {
      startPicker?.destroy();
      endPicker?.destroy();
    };
  }
  function updateStartDate(selectedDate: Date | null) {
    if (startPicker && endPicker && selectedDate) {
      startPicker.hide();
      endPicker.setMinDate(selectedDate);
      endPicker.setStartRange(selectedDate);
      endPicker.gotoDate(selectedDate);
      setEndRange(selectedDate);
      endPicker.show();
    }
  }
  function updateEndDate(selectedDate: Date | null) {
    if (startPicker && endPicker && selectedDate) {
      setEndRange(selectedDate);
      endPicker.hide();
      open = false;
      chosenDates = [
        startPicker?.getDate() ?? new Date(),
        // Add one day to include the final day
        endPicker?.getDate()
          ? new Date(endPicker!.getDate()!.getTime() + 1000 * 60 * 60 * 24)
          : null
      ];
    }
  }
  function setEndRange(endDate: Date | null) {
    endPicker?.setEndRange(endDate);
    endPicker?.draw(true);
  }

  $effect(() => {
    if (startInput && endInput && pickContainer) {
      return buildDatePicker(startInput, endInput);
    }
  });
</script>

<svelte:head>
  <!-- NOTE: this is an external cdn... probably ok -->
  <!-- TODO: remove once upgraded to DaisyUI 5 -->
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.jsdelivr.net/npm/@handsontable/pikaday/css/pikaday.css"
  />
</svelte:head>
<svelte:body
  onmousemove={(e) => {
    if (e.target instanceof HTMLElement) {
      if (!e.target?.classList.contains('pika-button')) {
        if (targeting) {
          targeting = false;
          setEndRange(endPicker?.getDate() ?? null);
        }
      } else {
        targeting = true;
        const pikaBtn = e.target!;
        const pikaDate = new Date(
          parseInt(pikaBtn.getAttribute('data-pika-year') ?? ''),
          parseInt(pikaBtn.getAttribute('data-pika-month') ?? ''),
          parseInt(pikaBtn.getAttribute('data-pika-day') ?? '')
        );
        setEndRange(pikaDate);
      }
    }
  }}
/>
<details class="dropdown" bind:open>
  <summary
    class="input input-bordered min-w-40 flex flex-row flex-wrap w-fit min-h-fit"
    onclick={() => {
      if (!open) {
        setEndRange(null);
        startPicker?.setDate(null);
        endPicker?.setDate(null);
        open = true;
        endPicker?.hide();
        startPicker?.show();
      } else {
        open = false;
        chosenDates = null;
      }
    }}
  >
    <input class="cal-input" type="text" readonly bind:this={startInput} {placeholder} />
    <input class="cal-input" type="text" readonly bind:this={endInput} />
  </summary>
  <div
    class="cal-container dropdown-content bg-base-100 rounded-box z-[1] w-fit p-2 shadow"
    bind:this={pickContainer}
  ></div>
</details>

<style lang="postcss">
  .cal-container :global(.is-inrange .pika-button),
  :global(.pika-button:hover) {
    @apply border-accent bg-base-300 text-base-content;
  }
  .cal-container :global(.is-startrange .pika-button),
  :global(.is-selected .pika-button) {
    @apply border-accent bg-accent;
  }
  .cal-input {
    margin: 4px 0;
    width: fit-content;
  }
  .cal-input:first-child {
    margin-right: 4px;
  }
</style>

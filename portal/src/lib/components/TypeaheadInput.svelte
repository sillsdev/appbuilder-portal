<script lang="ts" generics="T">
  import { createEventDispatcher } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  const dispatch = createEventDispatcher<{
    itemClicked: T;
  }>();
  export let props: HTMLInputAttributes = {};
  export let classes: string = '';
  export let dropdownClasses: string = '';
  export let getList: (searchTerm: string) => T[];
  export let search: string = '';
  $: list = getList(search);
  let selectedIndex = -1;
  let inputFocused = false;
  let inputElement: HTMLInputElement;

  function keypress(event: KeyboardEvent) {
    inputFocused = true;
    switch (event.key) {
      case 'ArrowDown':
        selectedIndex = selectedIndex + (1 % list.length);
        break;
      case 'ArrowUp':
        selectedIndex = selectedIndex - (1 % list.length);
        break;
      case 'Enter':
        selectItem(list[selectedIndex]);
        break;
    }
  }
  function selectItem(item: T) {
    inputElement.blur();
    // Clicked element will become first in fuzzy search
    selectedIndex = 0;
    // One sidecase: when an item is selected we want to close the menu but
    // input should stay selected and further keypresses should reopen the menu
    inputElement.focus();
    inputFocused = false;
    dispatch('itemClicked', item);
  }
  function onFocus() {
    selectedIndex = -1;
    inputFocused = true;
  }
</script>

<div class="relative">
  <input
    type="text"
    class="input input-bordered {classes}"
    bind:value={search}
    on:keydown={keypress}
    on:focus={onFocus}
    on:blur={() => (inputFocused = false)}
    bind:this={inputElement}
    {...props}
  />
  <slot name="custom" />
  {#if list.length}
    <ul
      class="bg-base-200 absolute z-10 rounded-lg p-2 shadow-xl {dropdownClasses}"
      class:hidden={!inputFocused}
      role="listbox"
    >
      {#each list as item, i}
        <li
          class:selected={i === selectedIndex}
          role="option"
          aria-selected={selectedIndex === i}
          on:mousedown={() => selectItem(item)}
          on:mouseover={() => (selectedIndex = i)}
          on:focus={() => (selectedIndex = i)}
        >
          <slot name="listElement" {item} />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
</style>

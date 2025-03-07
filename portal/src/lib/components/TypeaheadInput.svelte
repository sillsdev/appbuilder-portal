<script lang="ts" generics="T">
  import type { HTMLInputAttributes } from 'svelte/elements';

  let selectedIndex = $state(-1);
  let inputFocused = $state(false);
  interface Props {
    inputElProps?: HTMLInputAttributes;
    classes?: string;
    dropdownClasses?: string;
    getList: (searchTerm: string) => T[];
    search?: string;
    inputElement?: HTMLInputElement;
    custom?: import('svelte').Snippet;
    listElement?: import('svelte').Snippet<[any]>;
    onItemClicked?: (item: T) => void;
  }

  let {
    inputElProps = {},
    classes = '',
    dropdownClasses = '',
    getList,
    search = $bindable(''),
    inputElement = $bindable(undefined!),
    custom,
    listElement,
    onItemClicked
  }: Props = $props();

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
    onItemClicked?.(item);
  }
  function onFocus() {
    selectedIndex = -1;
    inputFocused = true;
  }
  let list = $derived(getList(search));
</script>

<div class="relative">
  <input
    type="text"
    class="input input-bordered {classes}"
    bind:value={search}
    onkeydown={keypress}
    onfocus={onFocus}
    onblur={() => (inputFocused = false)}
    bind:this={inputElement}
    {...inputElProps}
  />
  {@render custom?.()}
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
          onmousedown={() => selectItem(item)}
          onmouseover={() => (selectedIndex = i)}
          onfocus={() => (selectedIndex = i)}
        >
          {@render listElement?.({ item })}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
</style>

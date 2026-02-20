<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import type { ClassValue, HTMLInputAttributes } from 'svelte/elements';
  import IconContainer from '../icons/IconContainer.svelte';
  import type { IconType } from '$lib/icons';

  let selectedIndex = $state(-1);
  let inputFocused = $state(false);
  interface Props {
    inputElProps?: HTMLInputAttributes;
    class?: { default?: ClassValue; dropdown?: ClassValue };
    getList: (searchTerm: string) => T[];
    search?: string;
    inputElement?: HTMLInputElement;
    custom?: Snippet;
    listElement?: Snippet<[T, boolean]>;
    onItemClicked?: (item: T) => void;
    icon?: IconType;
  }

  let {
    inputElProps = {},
    class: classes,
    getList,
    search = $bindable(''),
    inputElement = $bindable(undefined!),
    custom,
    listElement,
    onItemClicked,
    icon
  }: Props = $props();

  function keypress(event: KeyboardEvent) {
    inputFocused = true;
    const rangeLength = list.length + 1;
    switch (event.key) {
      case 'ArrowDown':
        selectedIndex = (selectedIndex + rangeLength + 1) % rangeLength;
        break;
      case 'ArrowUp':
        selectedIndex = (selectedIndex + rangeLength - 1) % rangeLength;
        break;
      case 'Enter':
        event.preventDefault(); // this is to prevent triggering a form submission
        selectItem(list[selectedIndex]);
        break;
    }
  }
  function selectItem(item: T) {
    if (selectedIndex >= 0 && selectedIndex < list.length) {
      inputElement.blur();
      // Clicked element will become first in fuzzy search
      selectedIndex = 0;
      // One sidecase: when an item is selected we want to close the menu but
      // input should stay selected and further keypresses should reopen the menu
      inputElement.focus();
      inputFocused = false;
      onItemClicked?.(item);
    }
  }
  function onFocus() {
    selectedIndex = -1;
    inputFocused = true;
  }
  let list = $derived(getList(search));
</script>

<div class="relative">
  <label class={['input', classes?.default]}>
    {#if icon}
      <IconContainer {icon} width={20} class="opacity-80 cursor-pointer" />
    {/if}
    <input
      type="text"
      bind:value={search}
      onkeydown={keypress}
      onfocus={onFocus}
      onblur={() => (inputFocused = false)}
      bind:this={inputElement}
      {...inputElProps}
    />
  </label>
  {@render custom?.()}
  {#if list.length}
    <ul
      class={[
        'bg-base-200 absolute z-10 rounded-lg p-2 shadow-xl',
        classes?.dropdown,
        !inputFocused && 'hidden'
      ]}
      role="listbox"
    >
      {#each list as item, i}
        <li
          role="option"
          aria-selected={selectedIndex === i}
          onmousedown={() => selectItem(item)}
          onmouseover={() => (selectedIndex = i)}
          onfocus={() => (selectedIndex = i)}
        >
          {@render listElement?.(item, i === selectedIndex)}
        </li>
      {/each}
    </ul>
  {/if}
</div>

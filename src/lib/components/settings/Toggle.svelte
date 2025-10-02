<script lang="ts">
  import type { HTMLInputAttributes, ChangeEventHandler } from 'svelte/elements';
  import IconContainer from '../IconContainer.svelte';
  import InputWithMessage from './InputWithMessage.svelte';
  import type { ValueKey } from '$lib/locales.svelte';

  interface Props {
    title?: ValueKey;
    message?: ValueKey;
    name?: string;
    checked: boolean;
    canEdit?: boolean;
    onIcon?: string;
    offIcon?: string;
    className?: string;
    inputAttr?: HTMLInputAttributes;
  }

  let {
    title,
    message,
    name,
    checked = $bindable(),
    canEdit = true,
    onIcon = '',
    offIcon = '',
    className = canEdit ? '' : 'cursor-not-allowed',
    inputAttr
  }: Props = $props();
</script>

<InputWithMessage {title} {message} {className}>
  <label class="group">
    <div class="relative">
      <input
        {name}
        type="checkbox"
        class="sr-only group"
        bind:checked
        {...inputAttr}
        disabled={!canEdit}
      />
      <div
        class="block h-8 rounded-full bg-gray-3 dark:bg-dark-2 w-14 toggle group-has-checked:border-accent"
      ></div>
      <div
        class="absolute flex items-center justify-center w-6 h-6 transition bg-current rounded-full dark:bg-dark-5 left-1 top-1 group-has-checked:translate-x-full group-has-checked:bg-accent text-gray-400"
      >
        <span class="hidden group-has-checked:block">
          <!-- Switch on -> public -->
          <IconContainer icon={onIcon} class="-translate-y-px text-white" width="15" />
        </span>
        <span class="text-body-color dark:text-light group-has-checked:hidden">
          <!-- Switch off -> private -->
          <IconContainer icon={offIcon} class="-translate-y-px text-black" width="15" />
        </span>
      </div>
    </div>
  </label>
</InputWithMessage>

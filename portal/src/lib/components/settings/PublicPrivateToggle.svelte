<script lang="ts">
  import type { ValidI13nKey } from '$lib/locales.svelte';
  import IconContainer from '../IconContainer.svelte';
  import InputWithMessage from './InputWithMessage.svelte';

  interface Props {
    title?: { key: ValidI13nKey; parms?: any; classes?: string };
    message?: { key: ValidI13nKey; parms?: any; classes?: string };
    className?: string;
    formName?: string;
    checked: boolean;
    onchange?: () => void;
  }
  let {
    title,
    message,
    className = '',
    formName,
    checked = $bindable(),
    onchange
  }: Props = $props();
</script>

<InputWithMessage {title} {message} {className}>
  <label class="group">
    <div class="relative">
      <input name={formName} type="checkbox" class="sr-only group" bind:checked {onchange} />
      <div
        class="block h-8 rounded-full bg-gray-3 dark:bg-dark-2 w-14 toggle group-has-checked:border-accent"
      ></div>
      <div
        class="absolute flex items-center justify-center w-6 h-6 transition bg-current rounded-full dark:bg-dark-5 left-1 top-1 group-has-checked:translate-x-full group-has-checked:bg-accent text-gray-400"
      >
        <span class="hidden group-has-checked:block">
          <!-- Switch on -> public -->
          <IconContainer
            icon="mdi:lock-open-variant"
            class="-translate-y-px text-white"
            width="15"
          />
        </span>
        <span class="text-body-color dark:text-light group-has-checked:hidden">
          <!-- Switch off -> private -->
          <IconContainer icon="mdi:lock" class="-translate-y-px text-black" width="15" />
        </span>
      </div>
    </div>
  </label>
</InputWithMessage>

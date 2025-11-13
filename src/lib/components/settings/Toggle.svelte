<script lang="ts">
  import Icon from '@iconify/svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import InputWithMessage from './InputWithMessage.svelte';
  import type { ValueKey } from '$lib/locales.svelte';

  interface Props {
    title?: ValueKey;
    message?: ValueKey;
    name?: string;
    checked: boolean;
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
    onIcon = '',
    offIcon = '',
    className,
    inputAttr = {}
  }: Props = $props();
</script>

<InputWithMessage
  {title}
  {message}
  className="{className} {inputAttr.disabled ? 'cursor-not-allowed' : ''} "
>
  <label
    class="toggle {checked ? 'border-accent' : ''} text-base-content
           {inputAttr.disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}"
  >
    <input
      {name}
      type="checkbox"
      disabled={inputAttr.disabled}
      bind:checked
      {...inputAttr}
      class="checked:bg-accent checked:border-accent rounded-full"
    />
    <Icon icon={onIcon} width={20} height={20} />
    <Icon icon={offIcon} width={20} height={20} color="white" />
  </label>
</InputWithMessage>

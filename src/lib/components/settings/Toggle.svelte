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
    class?: string;
    inputAttr?: HTMLInputAttributes;
  }

  let {
    title,
    message,
    name,
    checked = $bindable(),
    onIcon = '',
    offIcon = '',
    class: classes,
    inputAttr = {}
  }: Props = $props();
</script>

<InputWithMessage {title} {message} class={[classes, inputAttr.disabled && 'cursor-not-allowed']}>
  <div
    class={[
      'toggle',
      checked && 'border-accent',
      inputAttr.disabled && 'cursor-not-allowed opacity-50 pointer-events-none'
    ]}
  >
    <input
      {name}
      type="checkbox"
      disabled={inputAttr.disabled}
      bind:checked
      {...inputAttr}
      class="checked:bg-accent checked:border-accent rounded-full"
    />
    <Icon icon={offIcon} width={20} height={20} />
    <Icon icon={onIcon} width={20} height={20} color="white" />
  </div>
</InputWithMessage>

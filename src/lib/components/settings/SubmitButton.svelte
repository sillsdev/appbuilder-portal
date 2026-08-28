<script lang="ts">
  import IconButton, { type IconButtonProps } from './IconButton.svelte';
  import { Icons } from '$lib/icons';

  interface Props extends IconButtonProps {
    waiting?: boolean;
  }

  let {
    class: classes,
    icon = Icons.Save,
    disabled = false,
    key = 'common_save',
    waiting = false,
    // eslint-disable-next-line svelte/valid-compile
    ...rest
  }: Props = $props();
</script>

<IconButton
  type="submit"
  class={['btn-primary', classes]}
  {icon}
  {key}
  disabled={disabled || waiting}
  {...rest}
  children={waiting ? loading : undefined}
/>

{#snippet loading()}
  <span class="loading loading-spinner"></span>
{/snippet}

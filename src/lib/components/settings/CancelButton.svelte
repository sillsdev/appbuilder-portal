<script lang="ts">
  import IconContainer from '../../icons/IconContainer.svelte';
  import IconButton, { type IconButtonProps } from './IconButton.svelte';
  import { Icons } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';

  interface Props extends IconButtonProps {
    returnTo?: string;
    resetForm?: boolean;
  }

  let {
    class: classes,
    icon = Icons.Cancel,
    key = 'common_cancel',
    returnTo: href,
    resetForm = false,
    // eslint-disable-next-line svelte/valid-compile
    ...rest
  }: Props = $props();
</script>

{#if !rest.children && href}
  <a class={['btn btn-secondary', classes]} {href}>
    <IconContainer {icon} width={20} />
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {m[key](rest.params as any)}
  </a>
{:else}
  <IconButton
    type={resetForm ? 'reset' : 'button'}
    class={['btn-secondary', classes]}
    {icon}
    {key}
    {...rest}
  />
{/if}

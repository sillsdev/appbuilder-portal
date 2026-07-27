<script lang="ts">
  import IconButton, { type IconButtonProps } from './IconButton.svelte';
  import { Icons } from '$lib/icons';

  let {
    class: classes,
    icon = Icons.Save,
    disabled = false,
    key = 'common_save',
    // eslint-disable-next-line svelte/valid-compile
    ...rest
  }: IconButtonProps = $props();
</script>

<IconButton type="submit" class={['btn-primary', classes]} {icon} {key} {disabled} {...rest} />

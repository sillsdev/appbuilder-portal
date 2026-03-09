<script lang="ts">
  import Icon from '@iconify/svelte';
  import type { ClassValue } from 'svelte/elements';
  import type { IconType } from '$lib/icons';

  interface Props {
    icon: IconType;
    width: number | string;
    tooltip?: string;
    class?: ClassValue;
  }

  let { icon, width, tooltip = '', class: classes = '' }: Props = $props();
</script>

<span
  class={['inline-block align-middle', classes]}
  style="width: {width}px; height: {width}px"
  title={tooltip}
>
  <Icon {icon} {width} class="" height={width} />
</span>

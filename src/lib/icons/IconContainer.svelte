<script lang="ts">
  import Icon from '@iconify/svelte';
  import type { ClassValue } from 'svelte/elements';
  import type { IconType } from '$lib/icons';

  interface Props {
    icon: IconType;
    width: number;
    tooltip?: string;
    class?: ClassValue;
  }

  let { icon, width, tooltip = '', class: classes = '' }: Props = $props();

  const imageCheck = /^(\/|https?:|data:)/;
</script>

<span
  class={['inline-block align-middle', classes]}
  style="width: {width}px; height: {width}px"
  title={tooltip}
>
  {#if imageCheck.test(icon)}
    <img src={icon} {width} height={width} alt="" />
  {:else}
    <Icon {icon} {width} class="" height={width} />
  {/if}
</span>

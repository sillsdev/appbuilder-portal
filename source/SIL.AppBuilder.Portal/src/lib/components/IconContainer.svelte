<script lang="ts">
  import Icon from '@iconify/svelte';

  interface Props {
    icon: string;
    width: number | string;
    tooltip?: string;
    class?: string;
  }

  let {
    icon,
    width,
    tooltip = '',
    class: classes = ''
  }: Props = $props();

  
</script>

<div
  class="inline-block align-middle {classes}"
  style="width: {width}px; height: {width}px"
  title={tooltip}
>
  <Icon {icon} {width} class="" height={width} />
</div>

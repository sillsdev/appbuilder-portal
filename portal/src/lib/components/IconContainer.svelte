<script lang="ts">
  import Icon from '@iconify/svelte';

  export let icon: string;
  export let width: number;
  export let classes: string = '';
</script>

<div class="inline-block align-middle {classes}" style="width: {width}px; height: {width}px">
  <Icon {icon} {width} class="inline" height={width} />
</div>

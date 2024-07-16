<script lang="ts">
  import Icon from '@iconify/svelte';

  export let icon: string;
  export let width: number | string;
  let classes: string = '';

  export { classes as class };
</script>

<div class="inline-block align-middle {classes}" style="width: {width}px; height: {width}px">
  <Icon {icon} {width} class="" height={width} />
</div>

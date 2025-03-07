<script lang="ts">
  // Arrow Back from https://fonts.google.com/icons
  // Filled = 0
  // Weight = 400
  // Grade = 0
  // Optical size = 24px
  interface Props {
    color?: string;
  }

  let { color = 'black' }: Props = $props();
</script>

<svg fill={color} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24">
  <path d="M480 896 160 576l320-320 57 56-224 224h487v80H313l224 224-57 56Z" />
</svg>

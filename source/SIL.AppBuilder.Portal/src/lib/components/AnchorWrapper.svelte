<!-- This was added solely so a link could be passed into TableWrapper -->
<script lang="ts">
  export let href: string;
  export let content: string;
  export let className: string = '';
</script>

<a href={href} class={className}>{content}</a>
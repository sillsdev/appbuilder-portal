<script lang="ts">
  import * as m from '../paraglide/messages';
  import IconContainer from './IconContainer.svelte';

  export let className: string = '';
  export let value: string;
</script>

<label class="input input-bordered flex items-center gap-2 {className}">
  <input type="text" placeholder={m.search()} class="flex-grow" bind:value={value} />
  <IconContainer icon="mdi:search" class="ml-auto" width={24} />
</label>
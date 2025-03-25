<script lang="ts">
  import { m } from '$lib/paraglide/messages';
</script>

<div class="w-full max-w-2xl mx-auto">
  <h1>{m.attributions_title()}</h1>
  <h2>{m.attributions_subtitle()}</h2>
  <ul>
    <li>
      <a href="https://opensource.org/license/MIT" class="link">MIT</a>
      <ul>
        <li>
          <a href="https://svelte.dev/" class="link">SvelteJS</a>
        </li>
      </ul>
    </li>
  </ul>
</div>

<style>
  ul {
    list-style-type: circle;
    padding-left: 20px;
  }
</style>

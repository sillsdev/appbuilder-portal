<script lang="ts">
  import * as m from '$lib/paraglide/messages';
</script>

<div class="w-full max-w-2xl mx-auto">
  <h1>{m.attributions_title()}</h1>
  <h2>{m.attributions_subtitle()}</h2>
  <ul>
    <li>
      <a href="https://opensource.org/license/MIT"> MIT</a>
      <ul>
        <li>
          <a href="https://svelte.dev/">SvelteJS</a>
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
  a {
    color: #33f;
    text-decoration: underline;
  }
</style>

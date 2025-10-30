<script lang="ts">
  import { m } from '$lib/paraglide/messages';

  interface Props {
    comment: string | null;
  }

  const { comment }: Props = $props();
</script>

<div class="comment">
  {#if comment?.startsWith('system.')}
    {#if comment.startsWith('system.build-failed')}
      <span>
        {m.system_buildFailed()}
      </span>
    {:else if comment.startsWith('system.publish-failed')}
      <span>
        {m.system_publishFailed()}
      </span>
    {/if}
    <span>-</span>
    <a
      class="link link-info"
      href={comment.replace(/system\.(build|publish)-failed,/, '')}
      target="_blank"
    >
      {m.publications_console()}
    </a>
  {:else}
    {comment ?? ''}
  {/if}
</div>

<style>
  .comment {
    border: calc(2 * var(--border)) inset var(--color-base-content);
    margin: var(--spacing);
    margin-left: calc(2 * var(--spacing));
    margin-right: calc(2 * var(--spacing));
    padding: var(--spacing);
  }
  .comment {
    @supports (color: color-mix(in lab, red, red)) {
      border-color: color-mix(in oklch, var(--color-base-content) 50%, #0000);
      background-color: color-mix(in oklch, var(--color-base-300) 15%, #0000);
    }
  }
</style>

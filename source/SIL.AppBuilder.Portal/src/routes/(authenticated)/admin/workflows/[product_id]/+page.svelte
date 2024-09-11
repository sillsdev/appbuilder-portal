<script lang="ts">
  import { NoAdminS3 } from 'sil.appbuilder.portal.common/workflow';
  import { useMachine } from '@xstate/svelte';
  import type { Snapshot } from 'xstate';
  import { createBrowserInspector } from '@statelyai/inspect';
  import { onMount } from 'svelte';

  export let data;

  onMount(() => {
    const { inspect } = createBrowserInspector({
      iframe: document.getElementById("inspector-frame")! as HTMLIFrameElement
    });
    const { snapshot, send, actorRef } = useMachine(NoAdminS3, {
      inspect: inspect,
      snapshot: (data.instance?.Snapshot) ? 
        JSON.parse(data.instance?.Snapshot || "") as Snapshot<unknown>
        : undefined
    })
    actorRef.start();
  });
</script>

<iframe id="inspector-frame" title="Workflow Instance {data.instance?.ProductId}"></iframe>

<style>
  iframe {
    width: 100%;
    height: 100%;
  }

</style>
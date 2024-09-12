<script lang="ts">
  import { NoAdminS3 } from 'sil.appbuilder.portal.common/workflow';
  import { useMachine } from '@xstate/svelte';
  import type { AnyEventObject, Snapshot, StateMachineDefinition } from 'xstate';
  import { Node, Svelvet, Anchor } from 'svelvet';

  export let data;

  const { snapshot, send, actorRef } = useMachine(NoAdminS3, {
    snapshot: data.instance?.Snapshot
      ? (JSON.parse(data.instance?.Snapshot || '') as Snapshot<unknown>)
      : undefined
  });

  function transform(
    machine: StateMachineDefinition<any, AnyEventObject>
  ): { id: number; label: string; connections: { id: number; target?: string; label?: string }[] }[] {
    const id = machine.id;
    const lookup = Object.keys(machine.states);
    const a = Object.entries(machine.states).map(([k, v]) => {return {
      id: lookup.indexOf(k),
      label: k,
      connections: Object.values(v.on).map((o) => {return {
        id: lookup.indexOf(o[0].toJSON().target?.at(0)?.replace('#'+id+'.', '') ?? ''),
        target: o[0].toJSON().target?.at(0)?.replace('#'+id+'.', ''),
        label: o[0].eventType
      }})
    }});
    console.log(JSON.stringify(a, null, 4));
    return a;
  }
</script>

<Svelvet
  minimap
  controls
  theme="dark"
  translation={{ x: -250, y: 0 }}
  endStyles={[null, 'arrow']}
>
  {#each transform(NoAdminS3.toJSON()) as state, i}
  <Node
    id={"N-"+state.id}
    dimensions={{ width: 200, height: 100 }}
    position={{ x: 300 + 200*(i % 3), y: 100 + 150*i }}
    dynamic={true}
  >
    <svg class="roundRect" height="100%" width="100%">
      <rect width="100%" height="100%" rx="10" ry="10" fill="slateblue" stroke="black" />
      <text class="nodeText" text-anchor="middle" font-size={15} fill="white" x="50%" y="60%">
        {state.label}
      </text>
    </svg>
    {#each state.connections as conn}
    <Anchor connections={[conn.id]} edgeLabel={conn.label} output invisible locked/>
    {/each}
    <Anchor input invisible locked/>
  </Node>
  {/each}
</Svelvet>

<style>
  :global(.svelvet-node) {
    box-shadow: none !important;
  }
  .nodeText {
    align-items: center;
  }
</style>

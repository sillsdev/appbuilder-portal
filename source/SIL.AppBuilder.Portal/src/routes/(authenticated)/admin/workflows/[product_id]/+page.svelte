<script lang="ts">
  import { NoAdminS3 } from 'sil.appbuilder.portal.common/workflow';
  import { useMachine } from '@xstate/svelte';
  import type {
    AnyEventObject,
    Snapshot,
    StateMachineDefinition,
    TransitionDefinition
  } from 'xstate';
  import { Node, Svelvet, Anchor } from 'svelvet';
  import { HamburgerIcon } from '$lib/icons/index.js';
  import { Springy } from '$lib/springyGraph.js';
  import { onMount } from 'svelte';

  export let data;

  const { snapshot, send, actorRef } = useMachine(NoAdminS3, {
    snapshot: data.instance?.Snapshot
      ? (JSON.parse(data.instance?.Snapshot || 'null') as Snapshot<unknown>)
      : undefined,
    input: {}
  });

  let selected: string = actorRef.getSnapshot().value;

  type StateNode = {
    id: number;
    label: string;
    connections: { id: number; target?: string; label?: string }[];
    inCount: number;
    start: boolean;
    final: boolean;
  };

  function targetStringFromEvent(
    e: TransitionDefinition<any, AnyEventObject>[],
    machineId: string
  ): string {
    return (
      e[0]
        .toJSON()
        .target?.at(0)
        ?.replace('#' + machineId + '.', '') ?? ''
    );
  }

  function transform(machine: StateMachineDefinition<any, AnyEventObject>): StateNode[] {
    const id = machine.id;
    const lookup = Object.keys(machine.states);
    const a = Object.entries(machine.states).map(([k, v]) => {
      return {
        id: lookup.indexOf(k),
        label: k,
        connections: Object.values(v.on).map((o) => {
          return {
            id: lookup.indexOf(targetStringFromEvent(o, id)),
            target: targetStringFromEvent(o, id),
            label: o[0].eventType
          };
        }),
        inCount: Object.entries(machine.states)
          .map(([k, v]) => {
            return Object.values(v.on).map((e) => {
              // treat no target on transition as self target
              return { from: k, to: targetStringFromEvent(e, id) || k };
            });
          })
          .reduce((p, c) => {
            return p.concat(c);
          }, [])
          .filter((v) => k === v.to).length,
        start: k === 'Start',
        final: v.type === 'final'
      };
    });
    return a;
  }

  function jumpState() {
    send({ type: 'jump', target: selected });
  }

  let positions: { [key: string]: Springy.Physics.Vector } = Object.keys(NoAdminS3.toJSON().states)
    .map((s) => {
      return { key: s, value: new Springy.Physics.Vector(0.0, 0.0) };
    })
    .reduce((p, c) => {
      p[c.key] = c.value;
      return p;
    }, {} as { [key: string]: Springy.Physics.Vector });

  let ready = false;

  onMount(() => {
    const graph = new Springy.Graph();
    graph.loadJSON({
      nodes: Object.keys(NoAdminS3.toJSON().states),
      edges: Object.entries(NoAdminS3.toJSON().states)
        .map(([k, v]) => {
          return Object.values(v.on).map((o) => [k, targetStringFromEvent(o, NoAdminS3.id)]);
        })
        .reduce((p, c) => p.concat(c), [])
    });
    const bounds = Math.ceil(Math.sqrt(graph.nodes.length));
    graph.addNodeData('Start', {
      label: 'Start',
      static: new Springy.Physics.Vector(-bounds, -bounds)
    });
    graph.addNodeData('Published', {
      label: 'Published',
      static: new Springy.Physics.Vector(bounds, bounds)
    });

    const layout = new Springy.ForceDirected(graph, 400.0, 400.0, 0.5, 0.00001);

    const renderer = new Springy.Renderer(
      layout,
      () => {}, // clear
      () => {}, // drawEdge
      (node: Springy.Node, position: Springy.Physics.Vector) => {
        // drawNode
        positions[node.id] = position;
      },
      () => {},
      () => {}, // onRenderStart
      () => {
        // onRenderFrame
        // begin showing earlier, still simulating, just less loading time
        if (layout.totalEnergy() < 0.5) {
          ready = true;
        }
      }
    );
    renderer.start();
  });
</script>

<div id="menu" class="p-5">
  <div class="bg-primary border-2 border-primary-content p-2 rounded">
    <details>
      <summary class="select-none cursor-pointer">
        <span class="flex flex-row">
          <HamburgerIcon color="white" />
          <strong>Information</strong>
        </span>
      </summary>
      <ul>
        <li>
          Project: {data.instance?.Product.Project.Name}
        </li>
        <li>
          Product: {data.instance?.Product.ProductDefinition.Name}
        </li>
        <li>
          Last Transition: {data.instance?.Product.ProductTransitions[0].InitialState}
        </li>
        <li>
          Date: {data.instance?.Product.ProductTransitions[0].DateTransition?.toLocaleTimeString()}
        </li>
      </ul>
      <button class="btn" on:click={jumpState}>
        Jump State to <em>{selected}</em>
      </button>
    </details>
  </div>
</div>
{#if ready}
  <Svelvet
    minimap
    controls
    fitView
    theme="dark"
    translation={{ x: 0, y: 0 }}
    endStyles={[null, 'arrow']}
  >
    {#each transform(NoAdminS3.toJSON()) as state, i}
      <Node
        id={'N-' + state.id}
        dimensions={{ width: 200, height: 100 }}
        position={positions[state.label].translateToScreenSpace(
          new Springy.Physics.Vector(0, 0),
          new Springy.Physics.Vector(150, 100)
        )}
        dynamic={true}
        editable={false}
      >
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <svg
          class="rect {$snapshot.value === state.label ? 'active' : ''} 
        {state.start ? 'start' : ''} 
        {state.final ? 'final' : ''}"
          on:click={() => {
            selected = state.label;
          }}
        >
          <rect
            width="100%"
            height="100%"
            rx="10"
            ry="10"
            class={selected === state.label ? 'selected' : ''}
          />
          <text text-anchor="middle" font-size={15} x="50%" y="60%">
            {state.label}
          </text>
        </svg>
        {#each state.connections as conn}
          <Anchor connections={[conn.id]} edgeLabel={conn.label} output invisible locked />
        {/each}
        {#each { length: state.inCount } as c}
          <Anchor input invisible locked />
        {/each}
      </Node>
    {/each}
  </Svelvet>
{:else}
  <span class="loading loading-spinner loading-lg" />
{/if}

<style lang="postcss">
  :global(.svelvet-node) {
    box-shadow: none !important;
  }
  .rect {
    @apply fill-neutral h-full w-full;
    stroke-width: 3px;
  }
  .rect text {
    @apply items-center fill-neutral-content;
  }
  .active {
    @apply fill-warning;
  }
  .start {
    @apply fill-success;
  }
  .final {
    @apply fill-info;
  }
  .selected {
    @apply stroke-white;
  }
  #menu {
    position: absolute;
    z-index: 5; /* position above canvas, but below drawer */
    right: 0;
  }

  details > summary {
    display: block; /* remove arrow */
  }

  details:not([open]) > summary strong {
    display: none;
  }

  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
  }
</style>

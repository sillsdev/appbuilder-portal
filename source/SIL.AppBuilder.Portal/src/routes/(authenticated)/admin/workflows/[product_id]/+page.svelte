<script lang="ts">
  import { Node, Svelvet, Anchor } from 'svelvet';
  import { HamburgerIcon } from '$lib/icons/index.js';
  import { Springy } from '$lib/springyGraph.js';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import * as m from '$lib/paraglide/messages';

  export let data;

  let active = data.form.data.state;

  const { form, enhance } = superForm(data.form, {
    onUpdate: () => {
      active = $form.state;
    },
    invalidateAll: false,
    resetForm: false
  });

  let positions: { [key: string]: Springy.Physics.Vector } = data.machine
    .map((s) => {
      return { key: s.label, value: new Springy.Physics.Vector(0.0, 0.0) };
    })
    .reduce((p, c) => {
      p[c.key] = c.value;
      return p;
    }, {} as { [key: string]: Springy.Physics.Vector });

  let ready = false;

  onMount(() => {
    const graph = new Springy.Graph();
    graph.loadJSON({
      nodes: data.machine.map((s) => s.label),
      edges: data.machine
        .map((s) => {
          return s.connections.map((c) => [s.label, c.target]);
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
    if ('Terminated' in graph.nodeSet) {
      graph.addNodeData('Terminated', {
        label: 'Terminated',
        static: new Springy.Physics.Vector(bounds, -bounds)
      });
    }
    graph.addNodeData('Synchronize Data', {
      label: 'Synchronize Data',
      static: new Springy.Physics.Vector(-bounds, bounds)
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
      () => {}, // onRenderStop
      () => {}, // onRenderStart
      () => {
        // If we show it this early, there will be practically no loading spinner
        // But there will also be much more movement when rendering
        // This should probably be discussed.
        ready = true;
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
  <div class="bg-primary border-2 border-primary-content p-2 rounded text-primary-content">
    <details>
      <summary class="select-none cursor-pointer">
        <span class="flex flex-row">
          <HamburgerIcon color="white" />
          <!-- TODO: i18n -->
          <strong>Information</strong>
        </span>
      </summary>
      <ul>
        <li>
          {m.project_title()}: {data.instance?.Product.Project.Name}
        </li>
        <li>
          {m.project_products_title()}: {data.instance?.Product.ProductDefinition.Name}
        </li>
        <li>
          Last Transition: {data.instance?.Product.ProductTransitions[0].InitialState}
          {data.instance?.Product.ProductTransitions[0].Command
            ? `(${data.instance?.Product.ProductTransitions[0].Command})`
            : ''}
        </li>
        <li>
          {m.project_products_transitions_date()}: {data.instance?.Product.ProductTransitions[0].DateTransition?.toLocaleTimeString()}
        </li>
      </ul>
      <form method="POST" use:enhance>
        <input type="hidden" name="state" bind:value={$form.state} />
        <input type="submit" class="btn" value="Jump State to {$form.state}" />
      </form>
    </details>
  </div>
</div>
{#if ready}
  <Svelvet
    minimap
    controls
    fitView
    edgeStyle="straight"
    theme="dark"
    translation={{ x: 0, y: 0 }}
    endStyles={[null, 'arrow']}
  >
    {#each data.machine as state, i}
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
          class="rect {active === state.label ? 'active' : ''} 
        {state.start ? 'start' : ''} 
        {state.final ? 'final' : ''}
        {state.action ? 'action' : ''}"
          on:click={() => {
            $form.state = state.label;
          }}
        >
          <rect
            width="100%"
            height="100%"
            rx="10"
            ry="10"
            class={$form.state === state.label ? 'selected' : ''}
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
  .action {
    @apply fill-base-100 stroke-black opacity-75;
  }
  .action text {
    @apply fill-base-content stroke-none;
  }
  #menu {
    position: absolute;
    z-index: 5; /* position above canvas, but below drawer */
    right: 0;
  }

  details > summary {
    display: block; /* remove arrow */
  }

  /* hide dropdown name when collapsed */
  details:not([open]) > summary strong {
    display: none;
  }

  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
  }
</style>

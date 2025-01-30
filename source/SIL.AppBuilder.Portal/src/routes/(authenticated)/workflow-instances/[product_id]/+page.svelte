<script lang="ts">
  import IconContainer from '$lib/components/IconContainer.svelte';
  import ProductDetails from '$lib/components/ProductDetails.svelte';
  import * as m from '$lib/paraglide/messages';
  import { Springy } from '$lib/springyGraph.js';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { Anchor, Node, Svelvet } from 'svelvet';

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

  function openModal(id: string) {
    (window[('modal' + id) as any] as any).showModal();
  }
</script>

<div class="h-full">
  <div class="navbar">
    <div class="breadcrumbs text-sm grow">
      <ul>
        <li>
          <a class="link" href="/projects/organization/{data.product?.Project.Organization.Id}">
            {data.product?.Project.Organization.Name}
          </a>
        </li>
        <li>
          <a class="link" href="/projects/{data.product?.Project.Id}">
            {data.product?.Project.Name}
          </a>
        </li>
        <li>
          <a class="link" href="/workflow-instances">
            {m.workflowInstances_title()}
          </a>
        </li>
        <li>
          {data.product?.ProductDefinition.Name}
        </li>
      </ul>
    </div>
    <span class="navbar-end w-auto">
      <div role="button" class="dropdown" tabindex="0">
        <div class="btn btn-ghost px-1">
          <IconContainer icon="charm:menu-kebab" width="20" />
        </div>
        <div
          class="dropdown-content top-12 right-0 p-1 bg-base-200 z-10 rounded-md min-w-36 w-auto shadow-lg"
        >
          <ul class="menu menu-compact overflow-hidden rounded-md">
            <li class="w-full rounded-none">
              <button class="text-nowrap" on:click={() => openModal(data.product.Id)}>
                {m.project_products_popup_details()}
              </button>
            </li>
            <li class="w-full rounded-none">
              <form method="POST" use:enhance>
                <input type="hidden" name="state" bind:value={$form.state} />
                <input
                  type="submit"
                  class="text-nowrap"
                  value={m.workflowInstances_jump({ state: $form.state })}
                />
              </form>
            </li>
          </ul>
        </div>
      </div>
    </span>
  </div>
  <ProductDetails product={data.product} />
  <div id="svelvet-wrapper">
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
              class="rect"
              class:active={active === state.label}
              class:start={state.start}
              class:final={state.final}
              class:action={state.action}
              on:click={() => {
                $form.state = state.label;
              }}
            >
              <rect
                width="100%"
                height="100%"
                rx="10"
                ry="10"
                class:selected={$form.state === state.label}
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
  </div>
</div>

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
  .navbar {
    height: 10%;
  }
  #svelvet-wrapper {
    height: 90%;
  }
  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
  }
</style>

<script lang="ts">
  import { NoAdminS3 } from 'sil.appbuilder.portal.common/workflow';
  import { useMachine } from '@xstate/svelte';
  import type { AnyEventObject, Snapshot, StateMachineDefinition } from 'xstate';
  import { Node, Svelvet, Anchor } from 'svelvet';
  import { HamburgerIcon } from '$lib/icons/index.js';
  import { instance } from 'valibot';

  export let data;

  const { snapshot, send, actorRef } = useMachine(NoAdminS3, {
    snapshot: data.instance?.Snapshot
      ? (JSON.parse(data.instance?.Snapshot || '') as Snapshot<unknown>)
      : undefined,
    input: {}
  });

  let selected: string = actorRef.getSnapshot().value;

  type StateNode = {
    id: number;
    label: string;
    connections: { id: number; target?: string; label?: string }[];
  };

  function transform(machine: StateMachineDefinition<any, AnyEventObject>): StateNode[] {
    const id = machine.id;
    const lookup = Object.keys(machine.states);
    const a = Object.entries(machine.states).map(([k, v]) => {
      return {
        id: lookup.indexOf(k),
        label: k,
        connections: Object.values(v.on).map((o) => {
          return {
            id: lookup.indexOf(
              o[0]
                .toJSON()
                .target?.at(0)
                ?.replace('#' + id + '.', '') ?? ''
            ),
            target: o[0]
              .toJSON()
              .target?.at(0)
              ?.replace('#' + id + '.', ''),
            label: o[0].eventType
          };
        })
      };
    });
    console.log(JSON.stringify(a, null, 4));
    return a;
  }

  function jumpState() {
    console.log(selected);
    console.log("old: "+$snapshot.value);
    send({ type: 'jump', target: selected});
    console.log("new: "+$snapshot.value);
  }
</script>

<div id="menu" class="p-5">
  <div class="bg-primary border-2 border-primary-content p-2 rounded">
    <details>
      <summary class="select-none cursor-pointer">
        <span class="flex flex-row">
          <HamburgerIcon color="white"/>
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
      <button class="btn" on:click={jumpState}>Jump State to <em>{selected}</em></button>
    </details>
  </div>
</div>
<Svelvet minimap controls theme="dark" translation={{ x: -250, y: 0 }} endStyles={[null, 'arrow']}>
  {#each transform(NoAdminS3.toJSON()) as state, i}
    <Node
      id={'N-' + state.id}
      dimensions={{ width: 200, height: 100 }}
      position={{ x: 300 + 200 * (i % 3), y: 100 + 150 * i }}
      dynamic={true}
      editable={false}
    >
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <svg
        class="rect {$snapshot.value === state.label? "active" : ""}"
        on:click={() => {
          selected = state.label;
        }}
      >
        <rect width="100%" height="100%" rx="10" ry="10" class="{selected === state.label? "selected": ""}" />
        <text text-anchor="middle" font-size={15} x="50%" y="60%">
          {state.label}
        </text>
      </svg>
      {#each state.connections as conn}
        <Anchor connections={[conn.id]} edgeLabel={conn.label} output invisible locked />
      {/each}
      <Anchor input invisible locked />
      <Anchor input invisible locked />
      <Anchor input invisible locked />
      <Anchor input invisible locked />
    </Node>
  {/each}
</Svelvet>

<style lang=postcss>
  :global(.svelvet-node) {
    box-shadow: none !important;
  }
  .rect {
    @apply fill-primary h-full w-full;
    stroke-width: 3px;
  }
  .rect text {
    @apply items-center fill-primary-content;
  }
  .active {
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
</style>

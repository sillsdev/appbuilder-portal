<script lang="ts" generics="V extends JsonSchema">
  import type { ClassValue } from 'svelte/elements';
  import { flatten, safeParse } from 'valibot';
  import { type JsonSchema } from '$lib/valibot';

  interface Props {
    value: string | null;
    name: string;
    class?: ClassValue;
    ok?: boolean;
    schema: V;
  }

  let { value = $bindable(), name, class: classes, ok = $bindable(true), schema }: Props = $props();

  let parsed = $state(safeParse(schema, value));

  let showErrors = $state(true);

  function parse() {
    parsed = safeParse(schema, value);
    showErrors = true;
    ok = parsed.success;
    if (parsed.success) {
      value = parsed.output;
    }
  }

  export function setValue(val: string | null) {
    value = val;
    parse();
  }
</script>

<div class="w-full">
  <textarea
    {name}
    class={['textarea h-48', classes]}
    onfocus={() => {
      showErrors = false;
    }}
    onchange={() => parse()}
    bind:value
  ></textarea>
  {#if showErrors && parsed.issues}
    {@const parseErrors = flatten<V>(parsed.issues)}
    <ul>
      {#each parseErrors.root ?? [] as error}
        <li class="text-red-500">
          <b>{error}</b>
        </li>
      {/each}
      {#if parseErrors.nested}
        {#each Object.entries(parseErrors.nested) as error}
          <li class="text-red-500">
            <b>{error[0]}:</b>
            {error[1]}
          </li>
        {/each}
      {/if}
      {#each parseErrors.other ?? [] as error}
        <li class="text-red-500">
          <b>{error}</b>
        </li>
      {/each}
    </ul>
  {/if}
</div>

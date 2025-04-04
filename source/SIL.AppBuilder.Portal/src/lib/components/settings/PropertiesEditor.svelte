<script lang="ts">
  import { propertiesSchema } from '$lib/valibot';
  import { flatten, safeParse } from 'valibot';

  interface Props {
    value: string | null;
    name: string;
    className?: string;
    ok?: boolean;
  }

  let { value = $bindable(), name, className = '', ok = $bindable(true) }: Props = $props();

  const parsed = $derived(safeParse(propertiesSchema, value));

  let rawValue = $state(value);

  $effect(() => {
    rawValue = value;
  });

  $effect(() => {
    ok = parsed.success;
  });
</script>

<div class="w-full">
  <textarea
    {name}
    class="textarea textarea-bordered h-48 {className}"
    onchange={() => {
      value = rawValue;
    }}
    bind:value={rawValue}
  ></textarea>
  {#if parsed.issues}
    {@const parseErrors = flatten<typeof propertiesSchema>(parsed.issues)}
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

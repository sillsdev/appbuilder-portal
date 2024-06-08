<!--
    @component
    A container box with a title and rows of internationalized information
    
-->
<script lang="ts">
    import { _ } from "svelte-i18n";
    export let title;
    export let fields: {key: string, value?: string | null}[];
</script>

<div class="flex flex-row border border-slate-600 p-2 mx-4 m-1 rounded-md">
    <div>
        <h3>{title}</h3>
        {#each fields as field}
            <p>
                <b>{$_(field.key)}: </b>
                {field.value ?? ""}
            </p>
        {/each}
    </div>
</div>

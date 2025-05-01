<script>
    import SearchPlayer from "./Search/SearchPlayer.svelte";
    import SearchTournaments from "./Search/SearchTournaments.svelte";
    import {backOut} from "svelte/easing";
    import {slide} from "svelte/transition";
    import {showSearchPlayer, showSearchTournament} from "../stores";

    export let map;
    export let form;

</script>

<div class="search-area" in:slide={{delay: 450, duration: 350, axis: 'x', easing: backOut}} out:slide={{duration: 350, axis: 'x'}}>
    {#if $showSearchTournament}
        <SearchTournaments bind:form bind:map />
    {/if}

    {#if $showSearchPlayer}
        <SearchPlayer bind:form/>
    {/if}
</div>


<style>
    .search-area {
        height: 100%;
        width: 100%;
        scrollbar-color: #20252b #161b1e;
        overflow: visible;
    }
</style>
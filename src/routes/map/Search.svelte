<script>
  import SearchPlayer from "./Search/SearchPlayer.svelte";
  import SearchTournaments from "./Search/SearchTournaments.svelte";
  import {backOut} from "svelte/easing";
  import {slide} from "svelte/transition";
  import {circles, showSearchPlayer, showSearchTournament, useCurrentLocationSearch} from "../stores";

  export let map;
  export let form;

   function removeCircles() {
    for (const i in $circles) {
      $circles[i].setMap(null, map);
    }
    $circles = [];
  }
</script>

<div class="search-area" in:slide={{delay: 450, duration: 350, axis: 'x', easing: backOut}}
     out:slide={{duration: 350, axis: 'x'}}>
  <div class="tab-bar">
    <button class={`tab ${$showSearchTournament ? 'selected' : ''}`} on:click={() => {
      showSearchTournament.set(true);
      showSearchPlayer.set(false);
      useCurrentLocationSearch.set(false);
      removeCircles();
    }}>Tournaments
    </button>
    <button class={`tab ${$showSearchPlayer ? 'selected' : ''}`} on:click={() => {
      showSearchTournament.set(false);
      showSearchPlayer.set(true);
    }}>Players
    </button>

  </div>
  {#if $showSearchTournament}
    <SearchTournaments bind:form bind:map/>
  {/if}

  {#if $showSearchPlayer}
    <SearchPlayer bind:form/>
  {/if}
</div>


<style>
  .search-area {
    height: 100%;
    width: 100%;
  }

  .tab-bar {
    width: 100%;
    display: flex;
  }

  .tab {
    font-size: 1.07em;
    background-color: #191c23;
    color: white;
    padding: 5px;
    cursor: pointer;
    flex: 1 1 0;
    border: none;
    border-bottom: #222222 2px solid;
  }

  .selected {
    background-color: #373b3e;
  }

  .tab:first-child {
    border-right: #222222 solid 2px;
  }
</style>
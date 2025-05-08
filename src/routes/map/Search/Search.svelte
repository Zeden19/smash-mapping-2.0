<script>
  import {slide} from "svelte/transition";
  import SearchPlayer from "./SearchPlayer.svelte";
  import SearchTournaments from "./SearchTournaments.svelte";
  import {circles, showSearchPlayer, showSearchTournament, useCurrentLocationSearch, showSearchName} from "../../stores.js";
  import SearchName from "./SearchName.svelte";

  export let map;
  export let form;

  function removeCircles() {
    for (const i in $circles) {
      $circles[i].setMap(null, map);
    }
    $circles = [];
  }
</script>

<div transition:slide class="search-area">
  <div class="tab-bar">
    <button class={`tab ${$showSearchTournament ? 'selected' : ''}`} on:click={() => {
      showSearchName.set(false);
      showSearchTournament.set(true);
      showSearchPlayer.set(false);
      useCurrentLocationSearch.set(false);
      removeCircles();
    }}>Tournaments
    </button>
    <button class={`tab ${$showSearchPlayer ? 'selected' : ''}`} on:click={() => {
      showSearchName.set(false);
      showSearchTournament.set(false);
      showSearchPlayer.set(true);
    }}>Players
    </button>
    <button class={`tab ${$showSearchName ? 'selected' : ''}`} on:click={() => {
      showSearchName.set(true);
      showSearchTournament.set(false);
      showSearchPlayer.set(false);
    }}>Name
    </button>
  </div>

  {#if $showSearchTournament}
    <SearchTournaments bind:form bind:map/>
  {/if}

  {#if $showSearchPlayer}
    <SearchPlayer bind:form/>
  {/if}

  {#if $showSearchName}
    <SearchName bind:form/>
  {/if}
</div>


<style>
  .search-area {
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

  .tab:first-child, .tab:nth-child(2) {
    border-right: #444 solid 2px;
  }
</style>
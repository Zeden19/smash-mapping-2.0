<script>
  import {blur} from 'svelte/transition';
  import {enhance} from "$app/forms";
  import {
    errorMessage,
    loading,
    noData,
    playerSearchResults,
    search,
    selectedPlayer,
    tooManyRequestsError
  } from "../../stores.js"

  export let form;

  let showResults = false;
  let screenSize;
  let inputElement;
  let timer;

  const debounce = (key) => {
    clearTimeout(timer);

    if ($search === '') {
      showResults = false;
      $playerSearchResults = null;
      return;
    }

    timer = setTimeout(() => {
      if ($search && key !== "Enter") {
        inputElement.requestSubmit();
      }
    }, 750);
  }
</script>

<svelte:window bind:innerWidth={screenSize}/>

<aside in:blur={{duration: 300}}>

  <div class="search">
    <form class="search-player-form" on:submit={() => clearTimeout(timer)} action="?/findPlayers" method="post"
          bind:this={inputElement} use:enhance={async ({}) => {
            $loading = true;
            if ($selectedPlayer) $selectedPlayer.index = null;
            return async ({update, result : {data : {playerData}}}) => {
                await update({reset: false});
                $playerSearchResults = playerData
                $loading = false;
                showResults = true;
            };
        }}>
      <input bind:value={$search} on:focus={() => showResults=true} on:keyup={({key}) => debounce(key)}
             type="text"
             placeholder="Search by Player tag"
             name="playerTagSearched"/>
    </form>


    <div class={`search-results ${!showResults && "hidden"}`}>
      {#if $loading}
        <p>Searching...</p>
      {:else if $playerSearchResults && $playerSearchResults.length > 0}
        {#each $playerSearchResults as player, index}
          <button on:click={() => {form.data = player.tournaments; $selectedPlayer = {player, index}}}
                  class={`player ${$selectedPlayer?.index === index ? "selected" : ''}`}>
            {#if player.prefix}
              <p class="prefix">{player.prefix}
            {/if}

            {player.gamerTag}

            {#if player.pfp}
              <img alt="pfp" src={player.pfp} class="icons">
            {/if}

            {#if player.country}
              <img alt="flag" src="flag-icons/{player.country.toLowerCase()}.svg"
                   class="icons flags">
            {/if}
          </button>
        {/each}

      {:else if $playerSearchResults && $playerSearchResults.length === 0}
        <p>No results found</p>
      {/if}
    </div>

  </div>


  {#if $selectedPlayer}
    <p>Selected Player:
      <a style="color: white" class="player-link" target="_blank"
         href="https://www.start.gg/{$selectedPlayer.player.slug}">{$selectedPlayer.player.gamerTag}</a>
    </p>
  {:else}
    <p>No player selected</p>
  {/if}
  <div class="bottom">

    <p>{$loading ? "Loading..." : ""}</p>

    <p class="error">{form?.error ? form.error : ""}</p>

    <p class="error">{$errorMessage ? "There was an error loading the map" : ""}</p>

    <p class="error">{$noData ? "No tournaments found" : ""}</p>

    <p class="error">{$tooManyRequestsError ? "You cannot search for more than 90 tournaments" : ""}</p>
  </div>

</aside>


<style>
  a {
    color: white;
    text-decoration: underline;
  }

  a:hover {
    text-decoration-color: red;
  }

  aside {
    overflow: scroll;
    height: 60%;
    font-family: "Kanit", serif;
    padding: 5px 0 5px 5px;
    white-space: nowrap;
    justify-items: left;
    text-align: left;
    position: relative;
    z-index: 0;
  }

  .search-player-form {
    position: relative;
    width: 100%;
  }

  .search {
    max-height: 60%;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  .search > form > input {
    font-size: 16px;
    width: 95%;
  }

  .search-results {
    overflow-y: scroll;
    width: 97%;
    background: white;

    display: flex;
    flex-direction: column;

    z-index: 5;

    scrollbar-color: auto;
    scrollbar-width: thin;
  }

  .search-results > p {
    color: black;
    margin-block-start: 0;
    margin-block-end: 0;
    margin-left: 5px;
  }

  .search-results:first-child {
    margin-top: 0;
  }

  .selected {
    background-color: #ffe5e5 !important;
    border-left: 4px solid #cc0000 !important;
    font-weight: bold !important;
    color: #cc0000 !important;
  }

  .prefix {
    font-size: 0.7em;
    color: #808080;
    align-self: flex-end;
  }

  .flags {
    width: 25px;
    height: 19px;
    margin-left: auto;
    margin-right: 5px;
  }

  .player {
    cursor: pointer;
    padding: 3px;

    display: flex;
    gap: 2px;
    background: white;
    border: black solid 1px;

    font-size: 1em;
  }

  .player > p, .player-link {
    margin-block-start: 0;
    margin-block-end: 0;
    padding-left: 5px;
  }

  .player:hover {
    background: #DDD;
  }

  .icons {
    width: 25px;
    height: 19px;
    align-self: center;
  }

  .error {
    color: red;
    white-space: normal;
  }

  .bottom {
    display: block;
    white-space: normal;
    position: sticky;
  }

  .hidden {
    display: none;
  }
</style>

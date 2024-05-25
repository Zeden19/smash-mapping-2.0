<script>
    import {blur} from 'svelte/transition';
    import {enhance} from "$app/forms";
    import {
        loading,
        errorMessage,
        noData,
        playerDoesNotExistError,
        tooManyRequestsError,
        showSearchPlayer,
        showSearchTournament,
        selectedPlayer,
        search
    } from "../../stores.js"

    export let form;

    let showResults = false;
    let screenSize;
    let inputElement;
    let promise;
    let timer;
    let searchResults;
    let searchInput;


    const debounce = (key) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if ($search && key !== "Enter") {
                inputElement.requestSubmit();
            }
        }, 750);
    }

    function handleFocusOut(event) {
        console.log(event.target)

    }

    $: if (form?.playerData) {
        promise = form.playerData;
    }

    $: if (form?.searchedPlayerData) {
        $selectedPlayer = form.searchedPlayerData;
        console.log($selectedPlayer);
    }

</script>

<svelte:window bind:innerWidth={screenSize}/>

<aside in:blur={{duration: 300}}>

    <div class="search">
        <form class="search-player-form" on:submit={() => clearTimeout(timer)} action="?/findPlayers" method="post"
              bind:this={inputElement} use:enhance={async ({}) => {
            // "dummy" promise here to make sure "Searching..." works
            promise = new Promise(() => {});
            $loading = true;
            return async ({update}) => {
                await update({reset: false});
                $loading = false;
                showResults = true;
                searchInput.focus()
            };
        }}>
            <input bind:value={$search} bind:this={searchInput} on:focus={() => showResults=true}
                   on:focusout={(event) => handleFocusOut(event)}
                   type="text"
                   placeholder="Search by Player tag"
                   name="playerTagSearched" on:keyup={({key}) => debounce(key)}/>
        </form>


        <div hidden="{!showResults}" on:focusout={() => showResults=false}
             bind:this={searchResults} role="searchbox" tabindex="0" class="search-results">
            {#await promise}
                <p>Searching...</p>
            {:then data}
                {#if data && data.length > 0}
                    {#each data as player}
                        <form action="?/playerSearch" method="POST"
                              use:enhance={async ({}) => {
                                      $loading = true;
                                      form.error = undefined;
                                      return async ({update}) => {
                                          await update({reset: false});
                                          $loading = false;
                                          searchInput.focus()
                                    };
                                  }}>
                            <input hidden="hidden" name="playerId" value={player.id}>


                            <button class="player">
                                {#if player.prefixes[0]}
                                    <p class="prefix">{player.prefixes[0]}{/if}

                                <p>{player.tag}</p>

                                {#if player.characters}
                                    <img class="icons characters" alt="character"
                                         src="character-icons/{Object.keys(player.characters).reduce((prevKey, currentKey) => {
                                        return player.characters[currentKey] > player.characters[prevKey] ? currentKey : prevKey;
                                    })}.svg">
                                {/if}
                                {#if player.country_code}
                                    <img alt="flag" src="flag-icons/{player.country_code.toLowerCase()}.svg"
                                         class="icons flags">
                                {/if}
                            </button>
                        </form>
                    {/each}
                {:else if data && data.length === 0}
                    <p>No results found</p>
                {/if}
            {:catch error}
                <p>There was an error.</p>
            {/await}
        </div>

    </div>


    {#if $selectedPlayer}
        <p>Selected Player:
            <a class="player-link" target="_blank"
               href="https://www.start.gg/{$selectedPlayer.user.slug}">{$selectedPlayer.gamerTag}</a>
        </p>
    {:else}
        <p>No player selected</p>
    {/if}

    <div class="bottom">
        <button disabled={$loading} on:click={() => {$showSearchPlayer = false; $showSearchTournament = true;}}>
            Tournament Search
        </button>

        <p>{$loading ? "Loading..." : ""}</p>

        <p class="error">{form?.error ? form.error : ""}</p>

        <p class="error">{$errorMessage ? "There was an error loading the map" : ""}</p>

        <p class="error">{$noData ? "No tournaments found" : ""}</p>

        <p class="error">{$tooManyRequestsError ? "You cannot search for more than 90 tournaments" : ""}</p>

        <p class="error">{$playerDoesNotExistError ? "Player does not exist, please select a different player." : ""}</p>
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
        width: 95%;
        background: white;

        display: flex;
        flex-direction: column;

        z-index: 5;
        border-radius: 0 5px 5px 5px;

        scrollbar-color: auto;
        scrollbar-width: thin;
        border-bottom: 2px solid black;
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

    .prefix {
        font-size: 0.7em;
        color: grey;
        align-self: flex-end;
    }

    .flags {
        width: 25px;
        height: 19px;
        margin-left: auto;
        margin-right: 5px;
    }

    .characters {
        width: 30px;
        height: 30px;
        margin-right: auto;
    }

    .player {
        cursor: pointer;
        height: 7%;
        width: 99%;
        padding: 0;
        margin: 0;

        display: flex;
        gap: 2px;
        background: white;
        border-radius: 0 5px 5px 0;
        border: black solid 1px;
        color: black;

        font-size: 1em;
    }

    .player > p, .player-link {
        margin-block-start: 0;
        margin-block-end: 0;
        color: black;
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
</style>

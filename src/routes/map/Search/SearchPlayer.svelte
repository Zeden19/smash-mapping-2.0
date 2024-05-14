<script>
    import {GraphQLClient} from "graphql-request";
    import {blur} from 'svelte/transition';
    import {CHECK_USER_EXISTS, SEARCH_BY_PLAYER} from "./queries.js";
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

    export let supabase;
    export let createTournamentsArray = () => {
    };

    export let showResults = false;
    let searchResultsContainer;

    export let data;
    let screenSize;

    export async function updateMap(id) {
        try {
            $tooManyRequestsError = false;
            $errorMessage = false;
            $loading = true;
            $noData = false;
            $playerDoesNotExistError = false;
            let tournamentsData;


            const apiVersion = 'alpha';
            const endpoint = 'https://api.start.gg/gql/' + apiVersion;
            const client = new GraphQLClient(endpoint, {
                headers: {
                    Authorization: 'Bearer ' + data.SMASH_GG_API_KEY,
                },
            });

            // query
            let query = SEARCH_BY_PLAYER;
            // query variables
            const variables = {
                id: id,
            };

            // Calling the API & filtering by minimum attendees
            let resData = await client.request(query, variables);

            if (resData.player.user === null) {
                const {errors} = await supabase.from('players').delete().eq('id', id);

                $playerDoesNotExistError = true;
                $loading = false;
                return;
            }

            tournamentsData = resData.player.user.tournaments.nodes;
            $selectedPlayer = resData.player;

            await createTournamentsArray(tournamentsData, null, 0);

        } catch (error) {
            $errorMessage = true;
            $loading = false;
            console.error('Error:', error);
        }
        $loading = false;
    }

    let promise;
    let playersList;
    let selectedPlayerIndex = -1;

    async function searchPlayers(player) {
        let {data: players} = await supabase.from('players').select('*').eq('tag', player);
        playersList = players;
        return players;
    }

    function handleKeyDown(event) {
        const totalPlayers = playersList.length;
        if (event.key === "ArrowDown") {
            selectedPlayerIndex = (selectedPlayerIndex + 1) % totalPlayers;
        } else if (event.key === "ArrowUp") {
            selectedPlayerIndex = (selectedPlayerIndex - 1 + totalPlayers) % totalPlayers;
        }

        console.log(selectedPlayerIndex)

        // Prevent scrolling the page when arrow keys are pressed
        event.preventDefault();
    }

    function handleSearchResultsBlur() {
        // Use a timeout to check if the focus has moved to the search results container
        setTimeout(() => {
            if (!searchResultsContainer.contains(document.activeElement)) {
                showResults = false;
                selectedPlayerIndex = null;
            }
        }, 100);
    }
</script>

<svelte:window bind:innerWidth={screenSize}/>

<aside in:blur={{duration: 300}}>

    <div class="search">
        <input bind:value={$search} on:focus={() => showResults = true}
               on:focusout={() => handleSearchResultsBlur()}
               on:keydown={(key) => {if (key.key === "Enter") promise = searchPlayers($search);}}
               type="text" placeholder="Search by Player tag"/>

        <div class="search-results" bind:this={searchResultsContainer} on:keydown={() => handleKeyDown}
             on:blur={() => (selectedPlayerIndex = null)}>
            {#await promise}
                <p>Searching...</p>
            {:then data}
                {#if showResults && data && data.length > 0}
                    {#each data as player, index}
                        <div tabindex="0" class="player"
                             on:keydown={(key) => {if (key.key === 'Enter') {updateMap(player.id); showResults = false;}}}
                             on:click={() => {updateMap(player.id); showResults = false;}}
                             class:red={selectedPlayerIndex === index}>

                            {#if player.prefixes[0]} <p class="prefix">{player.prefixes[0]}{/if}

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
                        </div>
                    {/each}
                {:else if showResults && data && data.length === 0}
                    <p>No results found</p>
                {/if}
            {:catch error}
                <p>There was an error.</p>
                {console.log(error)}
            {/await}
        </div>
    </div>

    {#if $selectedPlayer}
        <p>Selected Player: <a target="_blank"
                               href="https://www.start.gg/{$selectedPlayer.user.slug}">{$selectedPlayer.gamerTag}</a></p>
    {:else}
        <p>No player selected</p>
    {/if}

    <div class="bottom">
        <button disabled={$loading} on:click={() => {$showSearchPlayer = false; $showSearchTournament = true;}}>
            Tournament Search
        </button>

        <p>{$loading ? "Loading..." : ""}</p>

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
        height: 30vh;
        overflow-y: visible;
        overflow-x: scroll;
        font-family: "Kanit", serif;
        padding: 5px 0 5px 5px;
        white-space: nowrap;
        justify-items: left;
        text-align: left;
        position: relative;
        z-index: 0;
        scrollbar-color: #20252b #2c343c;
    }

    .search {
        padding: 5px 5px 0 5px;
        margin: auto;
        display: grid;
        position: relative;
        z-index: 1;
    }

    .search > input {
        font-size: 16px;
    }

    .search-results {
        background: white;
        display: grid;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 5;
        margin: 0 5px 0 5px;
        overflow-x: scroll;
        overflow-y: visible;
    }

    .search-results > p {
        color: black;
        margin-block-start: 0;
        margin-block-end: 0;
        margin-left: 5px;
    }

    .player {
        width: 100%;
        display: flex;
        border-radius: 3px;
        cursor: pointer;
        user-select: none;
    }

    .player > p, .player > p > a {
        margin-block-start: 0;
        margin-block-end: 0;
        color: black;
        padding-left: 5px;
    }

    .player.red {
        background: red;
    }

    .player:hover {
        background: #DDD;
    }

    .icons {
        width: 25px;
        height: 19px;
        align-self: center;
    }

    .prefix {
        font-size: 0.8em;
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
        margin-left: 5px;
    }

    .error {
        color: red;
        white-space: normal;
    }

    .bottom {
        display: block;
        white-space: normal;
    }


</style>

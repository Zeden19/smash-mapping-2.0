<script>
    import {GraphQLClient} from "graphql-request";
    import {blur} from 'svelte/transition';
    import {CHECK_USER_EXISTS, SEARCH_BY_PLAYER} from "./queries.js";

    export let supabase;
    export let createTournamentsArray = () => {
    };

    export let tooManyRequestsError = false;
    export let loading = false;
    export let errorMessage = false;
    export let noData = false;
    export let playerDoesNotExistError = false;

    export let selectedPlayer = "";
    export let selectedResult;
    export let showResults = false;

    export let showSearchTournament;
    export let showSearchPlayer;

    export let data;
    let screenSize;

    export let search;

    export async function updateMap(id) {
        try {
            tooManyRequestsError = false;
            errorMessage = false;
            loading = true;
            noData = false;
            playerDoesNotExistError = false;
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
                playerDoesNotExistError = true;
                loading = false;
                return;
            }

            tournamentsData = resData.player.user.tournaments.nodes;
            selectedPlayer = resData.player;

            await createTournamentsArray(tournamentsData, null, 0);

        } catch (error) {
            errorMessage = true;
            loading = false;
            console.error('Error:', error);
        }
        loading = false;
    }

    let promise;

    async function searchPlayers(player) {
        let {data: players} = await supabase.from('players').select('*').eq('tag', player);
        return players;
    }
</script>

<svelte:window bind:innerWidth={screenSize}/>

<aside in:blur={{duration: 300}}>

    <div class="search">
        <input bind:value={search} on:focus={() => showResults = true}
               on:focusout={() => { setTimeout(() => { showResults = false; }, 100);}}
               on:keydown={(key) => {if (key.key === "Enter") promise = searchPlayers(search, key) }}
               type="text" placeholder="Search by Player tag"/>

        <div class="search-results">
            {#await promise}
                <p>Searching...</p>
            {:then data}
                {#if showResults && data && data.length > 0}
                    {#each data as player}
                        <div class="player" on:click={() => updateMap(player.id)} class:red={selectedResult === player}>
                            {#if player.prefixes[0]}
                                <p class="prefix">{player.prefixes[0]}
                            {/if}

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

    {#if selectedPlayer}
        <p>Selected Player: <a target="_blank"
                               href="https://www.start.gg/{selectedPlayer.user.slug}">{selectedPlayer.gamerTag}</a></p>
    {:else}
        <p>No player selected</p>
    {/if}

    <div class="bottom">
        <button disabled={loading} on:click={() => {showSearchPlayer = false; showSearchTournament = true;}}>
            Tournament Search
        </button>

        <p>{loading ? "Loading..." : ""}</p>

        <p class="error">{errorMessage ? "There was an error loading the map" : ""}</p>

        <p class="error">{noData ? "No tournaments found" : ""}</p>

        <p class="error">{tooManyRequestsError ? "You cannot search for more than 90 tournaments" : ""}</p>

        <p class="error">{playerDoesNotExistError ? "Player does not exist, please select a different player." : ""}</p>
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

    button {
        background-color: black;
        border: none;
        color: white;
        padding: 10px 10px 8px 10px;
        font-size: 1.4em;
        margin: 5px 5px 5px 5px;
        border-radius: 20%;
        transition: right 0.5s ease-in-out;
        font-family: "Bebas Neue", serif;

    }

    button:hover {
        background-color: #555;
    }

    button:disabled {
        background-color: grey;
    }

    .bottom {
        display: block;
        white-space: normal;
    }


</style>

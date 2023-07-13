<script>
    import {GraphQLClient} from "graphql-request";
    import {Loader} from "@googlemaps/js-api-loader";
    import MultiSelect from 'svelte-multiselect'
    import {fade} from 'svelte/transition';
    import { blur } from 'svelte/transition';

    export let createTournamentsArray = () => {
    };

    export let tooManyRequestsError = false;
    export let loading = false;
    export let errorMessage = false;
    export let noData = false;
    export let cancelled = false;
    export let playerDoesNotExistError = false;
    export let selectedPlayer = "";

    export let showSearchTournament;
    export let showSearchPlayer;

    export let data;

    let screenSize;

    export let search;

    export async function updateMap() {
        try {
            tooManyRequestsError = false;
            errorMessage = false;
            loading = true;
            noData = false;
            cancelled = false;
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
            let query = `
            query tournamentByPlayerID($discriminator: String!) {
              user(slug: $discriminator) {
                id
                player {
                  id
                  gamerTag
                }
                tournaments(query: {filter: {upcoming: true}}) {
                  nodes {
                    name
                    venueAddress
                    startAt
                    primaryContact
                    url
                    numAttendees
                    isOnline
                    participants(query: {}) {
                      nodes {
                        gamerTag
                      }
                    }
                  }
                }
              }
            }`;
            // query variables
            const variables = {
                discriminator: "user/" + search,
            };

            // Calling the API & filtering by minimum attendees
            let resData = await client.request(query, variables);

            // returning if player does not exist
            if (resData.user === null) {
                playerDoesNotExistError = true;
                loading = false
                return;
            }

            console.log(resData);

            tournamentsData = resData.user.tournaments.nodes;
            selectedPlayer = resData.user.player.gamerTag;

            await createTournamentsArray(tournamentsData, null, 0);

        } catch (error) {
            errorMessage = true;
            loading = false;
            console.error('Error:', error);
        }
        loading = false;
    }
</script>

<svelte:window bind:innerWidth={screenSize}/>

<aside in:blur={{duration: 300}}>

    <div class="search">
        <input bind:value={search} type="text" placeholder="Search by Player ID"/>
    </div>

    <p>Selected Player: <a target="_blank" href="https://www.start.gg/user/{search}">{selectedPlayer}</a></p>

    <div class="bottom">
        <button on:click={async() => await updateMap()} disabled={loading}>Search</button>

        <button disabled={loading} on:click={() => {showSearchPlayer = false; showSearchTournament = true;}}>Tournament
            Search
        </button>

        {#if loading}
            <button on:click={() => {cancelled = true;}}>Cancel</button>
            <p>Loading...</p>
        {/if}

        <div class="info-container">
            <h3 class="info-title">INFO</h3>
            <p class="info-text"> To get a players ID, go to their start.gg page, and simply click their name, you should
                have their id copied to your clipboard. If not, simply copy the id manually.</p>
            <a target="_blank" href="hungrybox.png">Click here for example.</a>
        </div>


        {#if errorMessage}
            <p class="error">There was an error loading the map</p>
        {/if}

        {#if noData}
            <p class="error">No tournaments found</p>
        {/if}

        {#if tooManyRequestsError}
            <p class="error">You cannot search for more than 150 tournaments.</p>
        {/if}

        {#if cancelled}
            <p class="error">Request cancelled</p>
        {/if}

        {#if playerDoesNotExistError}
            <p class="error">Player does not exist, please see info above on how to get player.</p>
        {/if}
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
        height: 70%;
        overflow: visible;
        overflow-x: scroll;
        font-family: "Kanit", serif;
        padding: 5px 0 5px 5px;
        white-space: nowrap;
        justify-items: left;
        text-align: left;
    }

    .search {
        padding: 5px;
        margin: auto;
        display: grid;
    }

    .search > input {
        font-size: 16px;
    }

     .info-container {
        overflow: hidden;
    }

    .info-title {
        font-size: 1.5em;
        text-decoration: underline;
        text-align: center;
    }

    .info-text {
        width: 100%;
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

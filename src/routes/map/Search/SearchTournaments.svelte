<script>
    import {GraphQLClient} from "graphql-request";
    import {Loader} from "@googlemaps/js-api-loader";
    import MultiSelect from 'svelte-multiselect'
    import {fade} from 'svelte/transition';
    import {blur} from "svelte/transition";
    export let createTournamentsArray = () => {};

    let minDate = new Date();
    minDate.setDate(minDate.getDate() - 14);
    minDate = minDate.toISOString().split("T")[0];
    export let startDate = new Date().toISOString().split("T")[0];

    export let data;
    let games = [{label: "Ultimate", id: "1386", preselected: true}, {label: "Melee", id: "1"},
        {label: "Project M", id: "5"}, {label: "Street Fighter 6", id: "43868"}]

    export let endDate;
    export let country;
    export let minAttendees = 0;
    export let state;
    export let game = [];
    export let geolocated;

    export let tooManyRequestsError = false;
    export let loading = false;
    export let errorMessage = false;
    export let noData = false;
    export let cancelled = false;
    let screenSize;

    export let showSearchTournament;
    export let showSearchPlayer;

    export async function updateMap() {
        const selectedCountry = country;
        if (startDate > endDate) {
            alert("Start date must be before end date.");
            return;
        }

        if (endDate === undefined) {
            alert("Please enter an end date.");
            return;
        }

        if (isNaN(minAttendees)) {
            alert("Please enter a valid number for minimum attendees.");
            return;
        }

        if (minAttendees < 0) {
            alert("Minimum attendees must be greater than or equal to 0.");
            return;
        }

        try {
            tooManyRequestsError = false;
            errorMessage = false;
            loading = true;
            noData = false;
            cancelled = false;


            let tournamentsData;
            let unixStartTime = new Date(startDate.replace(/-/g, "/").replace("T", " "));
            let unixEndTime = new Date(endDate.replace(/-/g, "/").replace("T", " "));
            unixEndTime.setHours(23, 59, 59);
            unixStartTime = Math.floor(unixStartTime.getTime() / 1000);
            unixEndTime = Math.floor(unixEndTime.getTime() / 1000);

            const apiVersion = 'alpha';
            const endpoint = 'https://api.start.gg/gql/' + apiVersion;
            const client = new GraphQLClient(endpoint, {
                headers: {
                    Authorization: 'Bearer ' + data.SMASH_GG_API_KEY,
                },
            });

            // query
            let query = `
            query TournamentsByCountry($cCode: String!, $perPage: Int!, $after: Timestamp!, $before: Timestamp, $state: String, $game: [ID]) {
            tournaments(query: {perPage: $perPage, filter: {countryCode: $cCode, afterDate: $after, beforeDate: $before, videogameIds: $game, addrState: $state}})
            {
                nodes {
                  name
                  venueAddress
                  startAt
                  primaryContact
                  url
                  numAttendees
                  state
                  isOnline
                  participants(query: {perPage: 499}) {
                    nodes {
                      gamerTag
                    }
                  }
                }
              }
            }`;
            // query variables
            const variables = {
                cCode: country,
                perPage: 151,
                after: unixStartTime,
                before: unixEndTime,
                state: state,
                game: game.map(({id}) => id)
            };

            // Remove US specific query details
            if (state === "all" || country !== "US") {
                delete variables.state;
                query = query.replace(/addrState: \$state,?/, "").replace(", $state: String", "");
            }

            // Calling the API & filtering by minimum attendees
            let resData = await client.request(query, variables);

            tournamentsData = resData.tournaments.nodes;
            tournamentsData = tournamentsData.filter(function (tournament) {
                return minAttendees <= tournament['numAttendees'];
            });

            await createTournamentsArray(tournamentsData, selectedCountry, minAttendees);

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

    <div class="filter-item">
        <label>Game(s):</label>
        {#if screenSize > 500}
            <MultiSelect --sms-width="70%" --sms-text-color="black" --sms-bg="white" --sms-margin="auto"
                         --sms-remove-btn-hover-color="red" bind:value={game} options={games}/>
        {/if}
        {#if screenSize <= 500}
            <MultiSelect --sms-width="35vw" --sms-text-color="black" --sms-bg="white" --sms-margin="auto"
                         --sms-remove-btn-hover-color="red" --sms-font-size="16px" bind:value={game} options={games}/>
        {/if}
    </div>


    <div class="filter-item">
        <label>Country: </label>
        <select required name="country" bind:value={country}>
            <option disabled>---NORTH AMERICA---</option>
            <option selected value="US">USA</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
            <option disabled>---EUROPE---</option>
            <option value="ES">Spain</option>
            <option value="GB">United Kingdom</option>
            <option value="FR">France</option>
            <option value="NL">Netherlands</option>
            <option value="DK">Denmark</option>
            <option value="DE">Germany</option>
            <option value="CH">Switzerland</option>
            <option value="IT">Italy</option>
            <option value="SE">Sweden</option>
            <option value="NO">Norway</option>
            <option value="FI">Finland</option>
            <option disabled>---OTHER---</option>
            <option value="JP">Japan</option>
            <option value="AU">Australia</option>
            <option value="BR">Brazil</option>
            <option value="TW">Taiwan</option>
        </select>
    </div>


    {#if country === 'US'}
        <div transition:fade={{duration: 250}} class="filter-item">
            <label>State:</label>
            <select required name="state" bind:value={state}>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="DC">District Of Columbia</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
                <option value="all">All</option>
            </select>
        </div>
    {/if}

    <div class="filter-item">
        <label> From: </label>
        <input name="startDate" min={minDate} bind:value={startDate} type="date">
    </div>

    <div class="filter-item">
        <label> To: </label>
        <input name="endDate" min="{startDate}" bind:value={endDate} type="date">
    </div>


    <div class="filter-item">
        <label>Attendees: </label>
        <input name="attendees" type="number" min="0" step="1" bind:value={minAttendees}>
    </div>


    <div class="bottom">
        <button on:click={async() => await updateMap()} disabled={loading}>Search</button>

        <button disabled={loading} on:click={() => {showSearchPlayer = true; showSearchTournament = false;}}>Player Search</button>

        {#if loading}
            <button on:click={() => {cancelled = true;}}>Cancel</button>
            <p>Loading...</p>
        {/if}

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
    </div>
</aside>


<style>
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

    .filter-item {
        display: flex;
        margin-bottom: 5px;
    }

    .filter-item select, .filter-item input {
        margin-left: auto;
        margin-right: 3em;
        width: 50%;
        border-radius: 5px;
    }

    .error {
        color: red;
        white-space: normal;
    }

    button {
        background-color: black;
        border: none;
        color: white;
        padding: 10px 20px 8px 20px;
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

    @media (max-width: 500px) {
        .filter-item {
            width: 50%;
            white-space: normal;
        }

        .filter-item select, .filter-item input {
            margin-left: auto;
            margin-right: 0;
            width: 30vw;
        }
    }
</style>

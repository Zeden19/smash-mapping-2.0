<script>
    import {GraphQLClient} from "graphql-request";
    import MultiSelect from 'svelte-multiselect'
    import {fade} from 'svelte/transition';
    import {blur} from "svelte/transition";
    import {SEARCH_BY_LOCATION, SEARCH_BY_COUNTRY} from "./queries.js"

    export let createTournamentsArray = () => {
    };

    let minDate = new Date();
    minDate.setDate(minDate.getDate() - 14);
    minDate = minDate.toISOString().split("T")[0];
    export let startDate = new Date().toISOString().split("T")[0];

    export let endDate = new Date().setDate(new Date().getDate() + 7);
    endDate = new Date(endDate).toISOString().split("T")[0];

    export let map;
    export let data;
    let games = [{label: "Ultimate", id: "1386"}, {label: "Melee", id: "1"},
        {label: "Project +", id: "33602"}, {label: "SF6", id: "43868"}, {label: "GG: Strive", id: '33945'},
        {label: "MK: 11", id: "3200"},
    ]

    export let country;
    export let minAttendees = 0;
    export let state;
    export let game;

    export let tooManyRequestsError = false;
    export let loading = false;
    export let errorMessage = false;
    export let noData = false;
    let locationDeniedError = false;
    let screenSize;

    export let showSearchTournament;
    export let showSearchPlayer;
    export let useCurrentLocationSearch = false;
    export let radius;

    let innerCircle;
    let outerCircle;
    export let circles = [];

    let pos;

    // when user selects "Use current Location"
    $: if (useCurrentLocationSearch) {
        drawCircles();
    } else {
        removeCircles();
    }

    export async function updateMap() {
        if (game.length === 0) {
            game = games;
        }

        console.log(game)

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

        if (state === "Choose State" && country === "US") {
            alert("Please select a state.");
            return;
        }

        try {
            tooManyRequestsError = false;
            errorMessage = false;
            loading = true;
            noData = false;
            locationDeniedError = false;

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
            let query = SEARCH_BY_COUNTRY;
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

    async function useCurrentLocation() {
        await getPosition();
        map.panTo(pos);

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
            locationDeniedError = false;


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
            let query = SEARCH_BY_LOCATION;

            // query variables
            const variables = {
                coordinates: pos.lat + "," + pos.lng,
                radius: radius + "mi",
                perPage: 151,
                after: unixStartTime,
                before: unixEndTime,
                game: game.map(({id}) => id)
            };

            // Calling the API & filtering by minimum attendees
            let resData = await client.request(query, variables);
            tournamentsData = resData.tournaments.nodes;
            tournamentsData = tournamentsData.filter(function (tournament) {
                return minAttendees <= tournament['numAttendees'];
            });

            await createTournamentsArray(tournamentsData, null, minAttendees);

        } catch (error) {
            errorMessage = true;
            loading = false;
            console.error('Error:', error);
        }
        loading = false;
    }

    function removeCircles() {
        for (const i in circles) {
            circles[i].setMap(null);
        }
        circles = [];
    }

    async function drawCircles() {
        if (circles.length > 0) {
            removeCircles();
        }

        await getPosition();
        map.panTo(pos);

        // inne circle representing the search radius
        outerCircle = new google.maps.Circle({
            strokeColor: "#000000",
            strokeOpacity: 1,
            strokeWeight: 2.5,
            fillColor: "#FF0000",
            fillOpacity: 0.50,
            map,
            center: pos,
            radius: radius * 1609
        });

        // small circle for the current location
        innerCircle = new google.maps.Circle({
            strokeColor: "#000000",
            strokeOpacity: 1,
            strokeWeight: 2.5,
            fillColor: "#000000",
            fillOpacity: 1,
            map,
            center: pos,
            radius: 1000,
        });
        circles.push(innerCircle);
        circles.push(outerCircle);
    }

    function getPosition() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        resolve(pos);
                    },
                    (error) => {
                        locationDeniedError = true;
                        reject(error);
                    }
                );
            } else {
                reject(new Error('Geolocation is not supported in this browser.'));
            }
        });
    }
</script>
<svelte:window bind:innerWidth={screenSize}/>

<aside in:blur={{duration: 300}}>

    <div class="filter-item">
        <p>Game(s):</p>
        {#if screenSize > 500}
            <MultiSelect --sms-width="70%" --sms-text-color="black" --sms-bg="white" --sms-margin="auto"
                         --sms-remove-btn-hover-color="red" bind:value={game} options={games}/>
        {/if}
        {#if screenSize <= 500}
            <MultiSelect --sms-width="39vw" --sms-text-color="black" --sms-bg="white" --sms-margin="auto"
                         --sms-remove-btn-hover-color="red" --sms-font-size="16px" bind:value={game} options={games}/>
        {/if}
    </div>


    <div class="filter-item">
        <p>Country: </p>
        <select disabled="{useCurrentLocationSearch}" bind:value={country}>
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
        </select>
    </div>


    {#if country === 'US'}
        <div transition:fade={{duration: 250}} class="filter-item">
            <p>State:</p>
            <select disabled="{useCurrentLocationSearch}" bind:value={state}>
                <option selected disabled>Choose State</option>
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
        <p>Use Current Location:</p>
        <input class="current-location-checkbox" type="checkbox" bind:checked={useCurrentLocationSearch}/>
    </div>

    {#if useCurrentLocationSearch}
        <div transition:fade={{duration: 250}} class="filter-item">
            <p>Radius: </p>
            <select on:input={() => drawCircles()} bind:value={radius}>x
                <option selected value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
                <option value="250">250 miles</option>
                <option value="500">500 miles</option>
                <option value="1000">1000 miles</option>
            </select>
        </div>
    {/if}

    <div class="filter-item">
        <p> From: </p>
        <input min={minDate} bind:value={startDate} type="date">
    </div>

    <div class="filter-item">
        <p> To: </p>
        <input min="{startDate}" bind:value={endDate} type="date">
    </div>

    <div class="filter-item attendees-filter">
        <p>Attendees: </p>
        <input name="attendees" type="number" min="0" step="1" bind:value={minAttendees}>
    </div>

    <div class="bottom">
        <button on:click={useCurrentLocationSearch ? useCurrentLocation() : updateMap()} disabled={loading}>Search
        </button>

        <button disabled={loading} on:click={() => {
            showSearchPlayer = true; showSearchTournament = false; useCurrentLocationSearch = false; removeCircles();}}>
            Player Search
        </button>

        <p>{loading ? "Loading..." : ""}</p>

        <p class="error">{errorMessage ? "There was an error loading the map" : ""}</p>

        <p class="error">{noData ? "No tournaments found" : ""}</p>

        <p class="error">{tooManyRequestsError ? "You cannot search for more than 150 tournaments" : ""}</p>

        <p class="error">{locationDeniedError ? "You must allow location access to use this feature" : ""}</p>

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
        margin-right: 2vw;
        border-radius: 5px;
        width: 10vw;
    }

    .filter-item p {
        margin-block-start: 5px;
        margin-block-end: 5px;
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

    .attendees-filter {
        font-size: 16px;
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
            white-space: normal;
        }

        .filter-item select, .filter-item input {
            width: 30vw;
        }

        .filter-item .current-location-checkbox {
            width: 5vw;
        }
    }

    @media (min-width: 500px) and (max-width: 1000px) {
        .filter-item {
            white-space: normal;
        }

        .filter-item select, .filter-item input {
            width: 20vw;
        }

        .filter-item .current-location-checkbox {
            width: 5vw;
        }
    }
</style>

<script>
    import {onMount} from "svelte";
    import {enhance} from "\$app/forms";
    import MultiSelect from 'svelte-multiselect'
    import {fade} from 'svelte/transition';
    import {blur} from "svelte/transition";
    import GamesSlot from "./GamesSlot.svelte";
    import {
        startDate,
        endDate,
        country,
        errorMessage,
        minAttendees,
        state,
        game,
        loading,
        noData,
        tooManyRequestsError,
        locationDeniedError,
        showSearchPlayer,
        showSearchTournament,
        useCurrentLocationSearch,
        circles,
        radius,
        selectedPlayer
    } from "../../stores.js";
    import {games} from "$lib/vars.js";

    let minDate = new Date();
    minDate.setDate(minDate.getDate() - 14);
    minDate = minDate.toISOString().split("T")[0];
    $endDate = new Date($endDate).toISOString().split("T")[0];

    export let map;
    export let form;

    let screenSize;
    let innerCircle;
    let outerCircle;
    let pos;

    let formRoute = "?/countrySearch"

    function validationChecks() {

        if ($startDate > $endDate) {
            alert("Start date must be before end date.");
            return false;
        }

        if ($endDate === undefined || $startDate === undefined) {
            alert("Please enter an end date.");
            return false;
        }

        if (isNaN($minAttendees)) {
            alert("Please enter a valid number for minimum attendees.");
            return false;
        }

        if ($minAttendees < 0) {
            alert("Minimum attendees must be greater than or equal to 0.");
            return false;
        }

        if ($state === "Choose State" && $country === "US" && !$useCurrentLocationSearch) {
            alert("Please select a state.");
            return false;
        }

        if ($useCurrentLocationSearch && radius === undefined) {
            alert("Please select a radius range.");
            return false;
        }
        return true;
    }

    function removeCircles() {
        for (const i in $circles) {
            $circles[i].setMap(null);
        }
        $circles = [];
    }

    async function drawCircles() {
        if ($circles.length > 0) {
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
            radius: $radius * 1609
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
        $circles.push(innerCircle);
        $circles.push(outerCircle);
    }

    function getPosition() {
        $loading = true;
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        $locationDeniedError = false;
                        $loading = false;
                        resolve(pos);
                    },
                    (error) => {
                        $locationDeniedError = true;
                        $useCurrentLocationSearch = false;
                        $loading = false;
                        reject(error);
                    },
                    {timeout: 3000, enableHighAccuracy: true}
                );
            } else {
                $loading = false;
                reject(new Error('Geolocation is not supported in this browser.'));
            }
        });

    }

    onMount(() => {
        $useCurrentLocationSearch ? drawCircles() : removeCircles()
    })

    $: formRoute = $useCurrentLocationSearch ? "?/locationSearch" : "?/countrySearch"
</script>

<svelte:window bind:innerWidth={screenSize}/>

<aside in:blur={{duration: 300}}>
    <form use:enhance={async ({cancel, formData}) => {
        $tooManyRequestsError = false;
        $errorMessage = false;
        $noData = false;
        $locationDeniedError = false;

        if (form?.error) {
            form.error = undefined
        }
        $loading = true;
        $selectedPlayer = "";

         if ($game.length === 0) {
            $game = games;
        }

          if ($useCurrentLocationSearch) {
                await getPosition();
                $loading = true;
                formData.set("lat", pos.lat)
                formData.set("lng", pos.lng)
                map.panTo(pos);
        }


        if (!validationChecks()) {
            $loading = false;
            cancel();
        }

        return async ({update}) => {
            await update({reset: false});
            $loading = false;
        };
    }} method="POST" action={formRoute}>

        <!--Games-->
        <div class="filter-item">
            <p>Game(s):</p>
            {#if screenSize > 500}
                <MultiSelect --sms-width="75%" --sms-text-color="black" --sms-bg="white" --sms-margin="auto"
                             --sms-remove-btn-hover-color="red" placeholder="Select Game(s)"
                             --sms-border="1.5px solid black" --sms-options-border="1px solid black"
                             --sms-font-size="13px" --sms-selected-li-padding="2px"
                             bind:selected={$game} options={games} let:idx let:option name="game">
                    <GamesSlot {idx} {option}/>
                </MultiSelect>
            {/if}
            {#if screenSize <= 500}
                <MultiSelect --sms-width="39vw" --sms-text-color="black" --sms-bg="white" --sms-margin="auto"
                             --sms-remove-btn-hover-color="red" --sms-font-size="16px" placeholder="Select Game(s)"
                             --sms-border="1.5px solid black" --sms-options-border="1px solid black"
                             --sms-selected-li-padding="2px"
                             bind:value={$game} options={games} let:idx let:option name="game">
                    <GamesSlot {idx} {option}/>
                </MultiSelect>

            {/if}
        </div>


        <!--Country-->
        <div class="filter-item">
            <p>Country: </p>
            <select name="country" disabled="{$useCurrentLocationSearch}" bind:value={$country}>
                <option disabled>---NORTH AMERICA---</option>
                <option selected value="US">USA</option>
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
                <option disabled>---EUROPE---</option>
                <option value="ES">Spain</option>
                <option value="GB">United Kingdom</option>
                <option value="IE">Ireland</option>
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
                <option value="CN">China</option>
                <option value="AU">Australia</option>
                <option value="BR">Brazil</option>
            </select>
        </div>

        <!--State-->
        {#if $country === 'US'}
            <div transition:fade={{duration: 250}} class="filter-item">
                <p>State:</p>
                <select name="state" disabled="{$useCurrentLocationSearch}" bind:value={$state}>
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

        <!--Using Current Location-->
        <div class="filter-item">
            <p>Use Current Location:</p>
            <!-- reverse value of  useCurrentLocationSearch because on:input gets run b4 variable changes -->
            <input name="useCurrentLocation" class="current-location-checkbox" type="checkbox"
                   bind:checked={$useCurrentLocationSearch}
                   on:input={() => !$useCurrentLocationSearch ? drawCircles() : removeCircles()}/>

        </div>

        <!--Radius-->
        {#if $useCurrentLocationSearch}
            <div transition:fade={{duration: 250}} class="filter-item">
                <p>Radius: </p>
                <select name="radius" on:input={() => drawCircles()} bind:value={$radius}>x
                    <option selected value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                    <option value="250">250 miles</option>
                    <option value="500">500 miles</option>
                    <option value="1000">1000 miles</option>
                </select>
                <input name="pos" value={pos} type="hidden">
            </div>
        {/if}

        <!--From Date-->
        <div class="filter-item">
            <p> From: </p>
            <input required name="startDate" min={minDate} bind:value={$startDate} type="date">
        </div>

        <!--To Date-->
        <div class="filter-item">
            <p> To: </p>
            <input required name="endDate" min="{$startDate}" bind:value={$endDate} type="date">
        </div>

        <!--Attendees-->
        <div class="filter-item attendees-filter">
            <p>Attendees: </p>
            <input required name="attendees" type="number" min="0" step="1" bind:value={$minAttendees}>
        </div>

        <button class="search-button" disabled={$loading}>Search</button>
    </form>


    <div class="bottom">


        <button class="search-button" disabled={$loading} on:click={() => {
            $showSearchPlayer = true; $showSearchTournament = false; $useCurrentLocationSearch = false; removeCircles();}}>
            Player Search
        </button>

        <p>{$loading ? "Loading..." : ""}</p>

        <p class="error">{form?.error ? form.error : ""}</p>

        <p class="error">{$errorMessage ? "There was an error loading the map" : ""}</p>

        <p class="error">{$noData ? "No tournaments found" : ""}</p>

        <p class="error">{$tooManyRequestsError ? "You cannot search for more than 150 tournaments" : ""}</p>

        <p class="error">{$locationDeniedError ? "You must allow location access to use this feature" : ""}</p>

    </div>
</aside>


<style>
    aside {
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
        border: 1.5px solid black;
    }

    .filter-item p {
        margin-block-start: 5px;
        margin-block-end: 5px;
    }

    .error {
        color: red;
        white-space: normal;
    }

    .attendees-filter {
        font-size: 16px;
    }

    .bottom {
        display: block;
        white-space: normal;
    }

    :global(div.multiselect > ul.options > li) {
        border-bottom: 1px black solid;
    }

    :global(div.multiselect) {
        padding: 0;
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

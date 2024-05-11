<script>
    import SearchPlayer from "./Search/SearchPlayer.svelte";
    import SearchTournaments from "./Search/SearchTournaments.svelte";
    import {backOut} from "svelte/easing";
    import {slide} from "svelte/transition";
    import {onMount} from "svelte";
    import {Loader} from "@googlemaps/js-api-loader";
    import Discord from "../contact/Discord.svelte";

    export let startDate;
    export let endDate;
    export let country;
    export let minAttendees = 0;
    export let state;
    export let game;

    export let data;
    export let supabase;
    export let mapResult;
    export let map;

    export let loading = false;
    export let errorMessage = false;
    let noData = false;
    let tooManyRequestsError = false;
    let playerDoesNotExistError = false;
    export let circles = [];
    export let radius;


    export let showSearchPlayer;
    export let showSearchTournament;
    export let selectedPlayer;
    export let search;
    export let useCurrentLocationSearch = false;

    // loading geocoder
    const loader = new Loader({
        apiKey: data.GOOGLE_MAPS_API_KEY,
        version: "weekly",
    });
    let geocoder;
    onMount(async () => {
        loader.load().then(async () => {
            geocoder = new google.maps.Geocoder();
        });
    });


    async function geocode_address(tournament, country) {

        const {data} = await supabase.from('tournaments').select().eq('venue_address', tournament.venueAddress);
        // returning latlng from the database (no geocoding)
        if (data.length !== 0) {

            // adding tournament country if country is null
            if (data[0]['country'] === null) {
                console.log("Adding country to tournament");
                const {error} = await supabase
                    .from('tournaments')
                    .update({country: country})
                    .eq('venue_address', tournament.venueAddress);

                if (error) {
                    console.log("Error updating country:", error);
                }
            }
            return {lat: data[0]['lat'], lng: data[0]['lng']};

        } else {
            try {
                //geocoding the address
                console.log("Geocoding address")
                const results = await geocoder.geocode({'address': tournament.venueAddress});
                let result = results.results[0].geometry.location;


                let attendees = tournament.numAttendees;
                if (attendees === "unknown") {
                    attendees = null;
                }

                // inserting into database
                const {error} = await supabase
                    .from('tournaments')
                    .insert({
                        name: tournament.name,
                        lat: result.lat(),
                        lng: result.lng(),
                        start_at: tournament.startAt,
                        primary_contact: tournament.primaryContact,
                        url: tournament.url,
                        num_attendees: attendees,
                        state: tournament.state,
                        venue_address: tournament.venueAddress,
                        country: country
                    });

                if (error) {
                    console.log("Error inserting into database:", error);
                }

                return {lat: result.lat(), lng: result.lng()};

            } catch (error) {
                console.log("Error geocoding address:", error);
                return undefined;
            }
        }
    }

    // made this a function to be used in SearchPlayer and SearchTournaments
    async function createTournamentsArray(tournamentsData, selectedCountry, minAttendees) {
        let tournamentsArray = [];
        // returning if no tournaments found
        if (tournamentsData.length === 0) {
            loading = false;
            noData = true;
            return;
        }

        // returning if too many tournaments found
        if (tournamentsData.length > 150) {
            loading = false;
            tooManyRequestsError = true;
            return;
        }

        // If attendees is not known, change the attendees to be unknown
        if (minAttendees !== 0) {
            tournamentsData = tournamentsData.filter(item => item.numAttendees !== null && item.numAttendees !== undefined);
        } else {
            tournamentsData = tournamentsData.map(item => {
                if (item.numAttendees === null || item.numAttendees === undefined) {
                    item.numAttendees = "unknown";
                }
                return item;
            });
        }

        // getting the lat/lng for each tournament & creating mapResult object
        for (let tournament of tournamentsData) {
            let latlng;

            // fixing date format
            const timestamp = tournament.startAt;
            const date = new Date(timestamp * 1000);
            tournament.startAt = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });

            if (tournament.venueAddress !== null) {
                // getting latlng
                try {
                    latlng = await geocode_address(tournament, tournament.countryCode);
                } catch (e) {
                    console.log(e);
                    continue;
                }
            } else if (tournament.isOnline === true) {
                tournament.venueAddress = "Online"
                latlng = {lat: null, lng: null};
            }

            // pushing data to array
            const url = "https://start.gg" + tournament.url;
            if (latlng !== undefined) {
                tournamentsArray.push(
                    {
                        name: tournament.name,
                        lat: latlng.lat,
                        lng: latlng.lng,
                        primaryContact: tournament.primaryContact,
                        venueAddress: tournament.venueAddress,
                        url: url,
                        startAt: tournament.startAt,
                        numAttendees: tournament.numAttendees,
                        state: tournament.state,
                        participants: tournament.participants.nodes.map(({gamerTag}) => gamerTag),
                        image: tournament.images[0] ? tournament.images[0].url : "/trophy.png",
                    });
            }
        }

        mapResult = tournamentsArray;
        console.log(mapResult);
    }
</script>

<div in:slide={{delay: 450, duration: 350, axis: 'x', easing: backOut}} out:slide={{duration: 350, axis: 'x'}}>
    {#if showSearchTournament}
        <SearchTournaments {data} bind:showSearchTournament bind:showSearchPlayer
                           bind:loading bind:errorMessage bind:noData bind:tooManyRequestsError
                           bind:map bind:circles bind:useCurrentLocationSearch bind:radius
                           bind:startDate bind:endDate bind:country bind:minAttendees bind:game bind:state
                           {createTournamentsArray}/>
    {/if}

    {#if showSearchPlayer}
        <SearchPlayer {data} bind:showSearchTournament bind:showSearchPlayer
                      bind:loading bind:errorMessage bind:noData bind:tooManyRequestsError
                      bind:playerDoesNotExistError bind:selectedPlayer bind:search bind:supabase
                      {createTournamentsArray}/>
    {/if}

    <div class="discord"><p>Psst wanna stay updated? Join the Smash Mapping Discord server!</p>
        <Discord/>
    </div>
</div>


<style>
    p {
        text-align: left;
        margin: 5px;
    }

    .discord {
        position: relative;
        z-index: 0;
    }
</style>
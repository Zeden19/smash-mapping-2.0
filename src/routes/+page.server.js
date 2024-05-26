import {GOOGLE_MAPS_API_KEY, npm_config_node_gyp, SMASH_GG_API_KEY, SUPABASE_KEY} from "$env/static/private";
import {createClient} from '@supabase/supabase-js'
import {games, SEARCH_BY_COUNTRY, SEARCH_BY_LOCATION, SEARCH_BY_PLAYER} from "$lib/vars.js";
import {GraphQLClient} from "graphql-request";
import {Client} from "@googlemaps/google-maps-services-js";
import {fail} from "@sveltejs/kit";
import {minAttendees} from "./stores.js";


export const prerender = false;
const supabase = createClient('https://mifvquxknwmbszdrqwio.supabase.co',
    SUPABASE_KEY)

const client = new Client({});

async function getData(query, variables, minAttendees) {
    try {
        const apiVersion = 'alpha';
        const endpoint = 'https://api.start.gg/gql/' + apiVersion;
        const client = new GraphQLClient(endpoint, {
            headers: {
                Authorization: 'Bearer ' + SMASH_GG_API_KEY,
            },
        });

        let resData = await client.request(query, variables);
        let tournamentsData;

        // we return different data for player search
        if (resData.tournaments) {
            tournamentsData = resData.tournaments.nodes;
        } else {
            tournamentsData = resData;
        }


        return resData?.tournaments ? tournamentsData.filter(function (tournament) {
            return minAttendees <= tournament['numAttendees']
        }) : tournamentsData;

    } catch (error) {
        throw new Error("There was an getting the data. Please try again.")
    }
}

function getUnixTimes(startDate, endDate) {
    let unixStartTime = new Date(startDate.replace(/-/g, "/").replace("T", " "));
    let unixEndTime = new Date(endDate.replace(/-/g, "/").replace("T", " "));
    unixEndTime.setHours(23, 59, 59);
    unixStartTime = Math.floor(unixStartTime.getTime() / 1000);
    unixEndTime = Math.floor(unixEndTime.getTime() / 1000);
    return {"startDate": unixStartTime, "endDate": unixEndTime};

}

async function createTournamentsArray(tournamentsData, minAttendees) {
    let tournamentsArray = [];
    // returning if no tournaments found
    if (tournamentsData.length === 0) {
        throw new Error("No tournaments found");
    }

    // returning if too many tournaments found
    if (tournamentsData.length > 150) {
        throw new Error("You cannot search for more than 150 tournaments. \n" +
            "Tournaments found: " + tournamentsData.length);
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


    const {data} = await supabase.from('tournaments').select().in('venue_address',
        tournamentsData.map(item => item.venueAddress));
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
                latlng = await geocode_address(tournament, tournament.countryCode, data);

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
                    image: tournament.images[0] ? tournament.images[0].url : "/trophy.png",
                });
        }
    }
    return tournamentsArray;
}

async function geocode_address(tournament, country, tournamentData) {
    // returning latlng from the database (no geocoding)
    const foundAddresses = (tournamentData.map(tournament => tournament.venue_address));
    if (foundAddresses.includes(tournament.venueAddress)) {
        let latLng = tournamentData.find((item) => item.venue_address === tournament.venueAddress)
        return {lat: latLng.lat, lng: latLng.lng};

    } else {
        try {
            //geocoding the address
            console.log("Geocoding address")
            const results = (await client.geocode({
                params: {
                    key: GOOGLE_MAPS_API_KEY,
                    address: tournament.venueAddress,
                }
            }))

            let result = results.data.results[0].geometry.location

            let attendees = tournament.numAttendees;
            if (attendees === "unknown") {
                attendees = null;
            }

            // inserting into database
            const {error} = await supabase
                .from('tournaments')
                .insert({
                    name: tournament.name,
                    lat: result.lat,
                    lng: result.lng,
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

            return {lat: result.lat, lng: result.lng};

        } catch (error) {
            console.log("Error geocoding address:", error);
            return undefined;
        }
    }
}

export async function load({cookies}) {
    return {
        GOOGLE_MAPS_API_KEY,
        SMASH_GG_API_KEY,
        SUPABASE_KEY,
    };
}

export const actions = {
    countrySearch: async ({request}) => {
        // server side error checking
        const data = await request.formData();
        const startDate = data.get("startDate");
        const endDate = data.get("endDate");
        let game = JSON.parse(data.get("game"));
        const country = data.get("country")
        const state = data.get("state");
        const minAttendees = data.get("attendees");

        if (game.length === 0) {
            game = games
        }

        try {
            const unixTimes = getUnixTimes(startDate, endDate);

            let variables = {
                cCode: country,
                perPage: 300,
                after: unixTimes.startDate,
                before: unixTimes.endDate,
                state: state,
                game: game.map(({id}) => id)
            };
            let query = SEARCH_BY_COUNTRY;

            // Remove US specific query details
            if (state === "all" || country !== "US") {
                delete variables.state;
                query = query.replace(/addrState: \$state,?/, "").replace(", $state: String", "");
            }
            const tournamentsData = await getData(query, variables, minAttendees);
            const data = await createTournamentsArray(tournamentsData, minAttendees);
            return {data: data};

        } catch (error) {
            return fail(422, {
                error: error.message
            })
        }
    },

    locationSearch: async ({request}) => {
        const data = await request.formData();
        const startDate = data.get("startDate");
        const endDate = data.get("endDate");
        let game = JSON.parse(data.get("game"));
        const radius = data.get("radius");
        const lat = Number(data.get("lat"));
        const lng = Number(data.get("lng"));
        const minAttendees = data.get("attendees");

        if (game.length === 0) {
            game = games
        }

        try {
            const unixTimes = getUnixTimes(startDate, endDate);
            let variables = {
                coordinates: lat + "," + lng,
                radius: radius + "mi",
                perPage: 151,
                after: unixTimes.startDate,
                before: unixTimes.endDate,
                game: game.map(({id}) => id)
            }
            const tournamentsData = await getData(SEARCH_BY_LOCATION, variables, minAttendees);
            const data = await createTournamentsArray(tournamentsData, minAttendees);
            return {data: data};

        } catch (error) {
            return fail(422, {
                error: error.message
            })
        }
    },

    findPlayers: async ({request}) => {
        const data = await request.formData();
        const playerTag = data.get("playerTagSearched");

        try {
            let {data: players} = await supabase.from('players').select('*').eq('tag', playerTag);
            return {playerData: players};
        } catch (error) {
            return fail(422, {
                error: error.message
            });
        }

    },

    playerSearch: async ({request}) => {
        let data = await request.formData();
        const playerId = data.get("playerId");
        let variables = {id: playerId}

        try {
            const tournamentsData = await getData(SEARCH_BY_PLAYER, variables, 0);

            if (tournamentsData.player?.user?.slug === null || !tournamentsData.player?.user?.slug) {
                return fail(422, {
                    error: "Sorry, that user does not exist. Please try a new one."
                })
            }
            data = await createTournamentsArray(tournamentsData.player.user.tournaments.nodes, 0);

            return {
                data: data,
                searchedPlayerData: tournamentsData.player
            };
        } catch (error) {
            return fail(422, {
                error: error.message
            })
        }
    },
}
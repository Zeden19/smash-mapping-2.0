import {GOOGLE_MAPS_API_KEY, SMASH_GG_API_KEY} from "$env/static/private";
import {games, SEARCH_BY_COUNTRY, SEARCH_BY_GAMER_TAG, SEARCH_BY_LOCATION, SEARCH_BY_NAME} from "$lib/vars.js";
import {GraphQLClient} from "graphql-request";
import {fail} from "@sveltejs/kit";

export const prerender = false;

async function getData(query, variables, minAttendees, useUndocumented = false) {
    let resData;
    try {
        if (useUndocumented) {
            const endpoint = `https://www.start.gg/api/-/gql?query=${query}&variables=${JSON.stringify(variables)}`;
            const response = await fetch(endpoint);
            const {data: {players: {nodes}}} = await response.json();
            resData = nodes;
        } else {
            const apiVersion = 'alpha';
            const endpoint = 'https://api.start.gg/gql/' + apiVersion;
            const client = new GraphQLClient(endpoint, {
                headers: {
                    Authorization: 'Bearer ' + SMASH_GG_API_KEY,
                },
            });
            resData = await client.request(query, variables);
        }
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
        console.log(error)
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

function createTournamentsArray(tournamentsData, minAttendees, throwNoTournaments = true) {
    let tournamentsArray = [];
    // returning if no tournaments found
    if (tournamentsData.length === 0 && throwNoTournaments) {
        throw new Error("No tournaments found");
    }

    // returning if too many tournaments found
    if (tournamentsData.length > 300) {
        throw new Error("You cannot search for more than 300 tournaments. \n" +
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

    // getting the lat/lng for each tournament & creating mapResult object
    for (let tournament of tournamentsData) {
        // fixing date format
        const timestamp = tournament.startAt;
        const date = new Date(timestamp * 1000);
        tournament.startAt = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        if (tournament.isOnline === true) {
            tournament.venueAddress = "Online"
            tournament.lat = null;
            tournament.lng = null;
        }


        // pushing data to array
        const url = "https://start.gg" + tournament.url;
        if (tournament.lat !== undefined || tournament.lng !== undefined) {
            tournamentsArray.push(
                {
                    name: tournament.name,
                    lat: tournament.lat,
                    lng: tournament.lng,
                    primaryContact: tournament.primaryContact,
                    venueAddress: tournament.venueAddress,
                    url: url,
                    startAt: tournament.startAt,
                    numAttendees: tournament.numAttendees,
                    state: tournament.state,
                    thumbnail: tournament.thumbnail[0] ? tournament.thumbnail[0].url : "/trophy.png",
                    banner: tournament.banner[0] ? tournament.banner[0].url : null,
                });
        }
    }
    return tournamentsArray;
}

export async function load({cookies}) {
    return {
        GOOGLE_MAPS_API_KEY,
        SMASH_GG_API_KEY,
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
            const data = createTournamentsArray(tournamentsData, minAttendees, true);
            return {data};

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
            const data = createTournamentsArray(tournamentsData, minAttendees, true);
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
            const perPage = 50;
            const playerQuery = {
                "search": {
                    "filter": {
                        "gamerTag": playerTag,
                        "isUser": true,
                        "hideTest": true
                    },
                    "page": 1,
                    "perPage": perPage
                }
            }

            const data = await getData(SEARCH_BY_GAMER_TAG, playerQuery, 0, true);


            const playerData = data.map((player) => {
                if (!player.user) {
                    return null;
                }
                return {
                    gamerTag: player.gamerTag,
                    prefix: player.prefix,
                    slug: player.user.slug,
                    country: player.user.location?.country,
                    tournaments: createTournamentsArray(player.user.tournaments.nodes, 0, false),
                    pfp: player.user.images[0]?.url ?? null
                }
            }).filter((player) => player !== null);
            console.log(playerData)


            return {playerData};
        } catch (error) {
            return fail(422, {
                error: error.message
            });
        }

    },

    nameSearch: async ({request}) => {
        const data = await request.formData();
        const name = data.get("tournamentName");
        const variables = {name}
        try {
            const tournamentData = await getData(SEARCH_BY_NAME, variables, 0);
            const data = createTournamentsArray(tournamentData, 0, true);
            return {data}

        } catch (error) {
            return fail(422, {
                error: error.message
            })
        }

    }
}
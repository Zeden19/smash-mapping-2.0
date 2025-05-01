import {GOOGLE_MAPS_API_KEY, SMASH_GG_API_KEY} from "$env/static/private";
import {games, GET_PLAYER_DATA, SEARCH_BY_COUNTRY, SEARCH_BY_LOCATION} from "$lib/vars.js";
import {GraphQLClient} from "graphql-request";
import {fail} from "@sveltejs/kit";

export const prerender = false;

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

function createTournamentsArray(tournamentsData, minAttendees) {
    let tournamentsArray = [];
    // // returning if no tournaments found
    // if (tournamentsData.length === 0) {
    //     throw new Error("No tournaments found");
    // }
    //
    // // returning if too many tournaments found
    // if (tournamentsData.length > 150) {
    //     throw new Error("You cannot search for more than 150 tournaments. \n" +
    //         "Tournaments found: " + tournamentsData.length);
    // }

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
                    image: tournament.images[0] ? tournament.images[0].url : "/trophy.png",
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
            const data = createTournamentsArray(tournamentsData, minAttendees);
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
            const data = createTournamentsArray(tournamentsData, minAttendees);
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
            const response = await fetch(`https://api.smash.gg/players?filter={"gamerTag":%20"${playerTag}"}&page=1&per_page=${perPage}`);
            const data = await response.json();
            let players = data.items.entities.player;
            const total = data.total_count;
            let pagesRequired = Math.ceil(total / perPage);

            let userIds = players.filter(player => player.hasUser).map(player => player.id);
            while (pagesRequired !== 1) {
                const response = await fetch(`https://api.smash.gg/players?filter={"gamerTag":%20"${playerTag}"}&page=1&per_page=${perPage}`);
                const data = await response.json();
                let players = data.items.entities.player;
                userIds.concat(players.filter(player => player.hasUser).map(player => player.id));
                pagesRequired--;
            }


            let playerData = []
            for (let i = 0; i < userIds.length; i++) {
                const {player} = await getData(GET_PLAYER_DATA, {id: userIds[i]}, 0);
                playerData.push({
                    gamerTag: player.gamerTag,
                    prefix: player.prefix,
                    slug: player.user.slug,
                    country: player.user.location?.country,
                    tournaments: createTournamentsArray(player.user.tournaments.nodes)
                });
            }
            console.log(playerData)


            return {playerData};
        } catch (error) {
            return fail(422, {
                error: error.message
            });
        }

    },
}
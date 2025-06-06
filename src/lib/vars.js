export const games = [{label: "Ultimate", id: "1386", src: "game-icons/ultimate.png"},
    {label: "Melee", id: "1", src: "game-icons/melee.png"},
    {label: "P+", id: "33602", src: "game-icons/p+.png"},
    {label: "SF6", id: "43868", src: "game-icons/SF6.png"},
    {label: "GG: Strive", id: '33945', src: "game-icons/GGS.png"},
    {label: "MK 1", id: "48599", src: "game-icons/MK1.png"},
    {label: "Tekken 8", id: "49783", src: "game-icons/tekken8.png"},
    {label: "SC VI", id: "904", src: "game-icons/SK6.png"},
    {label: "Skullgirls", id: "32", src: "game-icons/skullgirls.png"},
    {label: "Rivals 2", id: "53945", src: "game-icons/rivals2.png"},
    {label: "DBFZ", id: "287", src: "game-icons/DBFZ.png"},

]

export let SEARCH_BY_COUNTRY = `query TournamentsByCountry($cCode: String!, $perPage: Int!, $after: Timestamp!, $before: Timestamp, $state: String, $game: [ID]) { 
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
                    countryCode 
                    lat 
                    lng 
                    thumbnail: images(type: "profile") { 
                      url 
                    } 
                    banner: images(type: "banner") { 
                      url 
                    } 
                  } 
                } 
              }`;

export let SEARCH_BY_LOCATION = `query TournamentsByLocation($coordinates: String!, $radius: String!, $perPage: Int!, $after: Timestamp!, $before: Timestamp!, $game: [ID]) { 
                tournaments( 
                  query: {perPage: $perPage, filter: {location: {distanceFrom: $coordinates, distance: $radius}, afterDate: $after, beforeDate: $before, videogameIds: $game}} 
                ) { 
                  nodes { 
                    name 
                    venueAddress 
                    startAt 
                    primaryContact 
                    url 
                    numAttendees 
                    state 
                    isOnline 
                    countryCode 
                    lat 
                    lng 
                    thumbnail: images(type: "profile") { 
                      url 
                    } 
                    banner: images(type: "banner") { 
                      url 
                    } 
                  } 
                } 
              }`;

export const SEARCH_BY_GAMER_TAG = `query SearchByGamerTag($search: PlayerQuery!) {
  players(query: $search) {
    pageInfo {
      page
      totalPages
    }
    nodes {
      gamerTag
      prefix
      user {
        slug
        location {
          country
        }
        images(type: "profile") {
          url
        }
        tournaments(query: {filter: {upcoming: true}}) {
          nodes {
            name
            venueAddress
            startAt
            primaryContact
            url
            numAttendees
            state
            isOnline
            countryCode
            lat
            lng
            banner: images(type: "banner") {
              url
            }
        thumbnail: images(type: "profile") {
              url
            }
          }
        }
      }
    }
  }
}
`;

export let SEARCH_BY_NAME = `query TournamentNameSearch($name: String!) {
  tournaments(query: {filter: {name: $name, upcoming: true}}) {
    nodes {
      name
      venueAddress
      startAt
      primaryContact
      url
      numAttendees
      state
      isOnline
      countryCode
      lat
      lng
      banner: images(type: "banner") {
        url
      }
      thumbnail: images(type: "profile") {
        url
      }
    }
  }
}
`
